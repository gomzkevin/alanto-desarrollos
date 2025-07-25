-- Create audit_log table first, then enhanced security features

-- 1. Create audit_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    user_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_email TEXT,
    user_role TEXT,
    empresa_id INTEGER,
    ip_address TEXT,
    user_agent TEXT,
    session_id TEXT
);

-- Enable RLS on audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Audit log policies - admin only access
CREATE POLICY "audit_log_admin_only" ON public.audit_log
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM usuarios u 
        WHERE u.auth_id = auth.uid() 
        AND (u.rol = 'admin' OR u.is_company_admin = true)
    )
);

-- 2. Enhanced audit logging function
CREATE OR REPLACE FUNCTION public.enhanced_audit_log() 
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_id_val UUID;
    user_email_val TEXT;
    user_role_val TEXT;
    empresa_id_val INTEGER;
BEGIN
    -- Get user information for audit trail
    SELECT auth.uid() INTO user_id_val;
    
    -- Get additional user info from usuarios table
    SELECT u.email, u.rol, u.empresa_id 
    INTO user_email_val, user_role_val, empresa_id_val
    FROM usuarios u 
    WHERE u.auth_id = user_id_val;
    
    -- Enhanced audit logging with more context
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (
            table_name, 
            operation, 
            old_data, 
            user_id, 
            user_email,
            user_role,
            empresa_id,
            ip_address,
            user_agent
        ) VALUES (
            TG_TABLE_NAME, 
            TG_OP, 
            row_to_json(OLD), 
            user_id_val,
            user_email_val,
            user_role_val,
            empresa_id_val,
            CASE 
                WHEN current_setting('request.headers', true) IS NOT NULL 
                THEN current_setting('request.headers', true)::json->>'x-forwarded-for'
                ELSE NULL
            END,
            CASE 
                WHEN current_setting('request.headers', true) IS NOT NULL 
                THEN current_setting('request.headers', true)::json->>'user-agent'
                ELSE NULL
            END
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (
            table_name, 
            operation, 
            old_data, 
            new_data, 
            user_id,
            user_email,
            user_role,
            empresa_id,
            ip_address,
            user_agent
        ) VALUES (
            TG_TABLE_NAME, 
            TG_OP, 
            row_to_json(OLD), 
            row_to_json(NEW), 
            user_id_val,
            user_email_val,
            user_role_val,
            empresa_id_val,
            CASE 
                WHEN current_setting('request.headers', true) IS NOT NULL 
                THEN current_setting('request.headers', true)::json->>'x-forwarded-for'
                ELSE NULL
            END,
            CASE 
                WHEN current_setting('request.headers', true) IS NOT NULL 
                THEN current_setting('request.headers', true)::json->>'user-agent'
                ELSE NULL
            END
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (
            table_name, 
            operation, 
            new_data, 
            user_id,
            user_email,
            user_role,
            empresa_id,
            ip_address,
            user_agent
        ) VALUES (
            TG_TABLE_NAME, 
            TG_OP, 
            row_to_json(NEW), 
            user_id_val,
            user_email_val,
            user_role_val,
            empresa_id_val,
            CASE 
                WHEN current_setting('request.headers', true) IS NOT NULL 
                THEN current_setting('request.headers', true)::json->>'x-forwarded-for'
                ELSE NULL
            END,
            CASE 
                WHEN current_setting('request.headers', true) IS NOT NULL 
                THEN current_setting('request.headers', true)::json->>'user-agent'
                ELSE NULL
            END
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$;

-- 3. Create rate limiting table for advanced rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    identifier TEXT NOT NULL, -- email, IP, or user_id
    action_type TEXT NOT NULL, -- 'login', 'signup', 'password_reset', etc.
    attempt_count INTEGER DEFAULT 1,
    first_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(identifier, action_type)
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Rate limits policies - restrictive access
CREATE POLICY "rate_limits_admin_only" ON public.rate_limits
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM usuarios u 
        WHERE u.auth_id = auth.uid() 
        AND (u.rol = 'admin' OR u.is_company_admin = true)
    )
);

-- 4. Create security events table for tracking security-related events
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL, -- 'failed_login', 'password_change', 'suspicious_activity', etc.
    user_id UUID,
    email TEXT,
    ip_address TEXT,
    user_agent TEXT,
    details JSONB,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on security_events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Security events policies - admin only
CREATE POLICY "security_events_admin_only" ON public.security_events
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM usuarios u 
        WHERE u.auth_id = auth.uid() 
        AND (u.rol = 'admin' OR u.is_company_admin = true)
    )
);

-- 5. Function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_identifier TEXT,
    p_action_type TEXT,
    p_max_attempts INTEGER DEFAULT 5,
    p_window_minutes INTEGER DEFAULT 15,
    p_block_minutes INTEGER DEFAULT 30
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_limit RECORD;
    is_blocked BOOLEAN := false;
    attempts_left INTEGER;
    result JSONB;
BEGIN
    -- Get current rate limit record
    SELECT * INTO current_limit
    FROM rate_limits 
    WHERE identifier = p_identifier 
    AND action_type = p_action_type;
    
    -- Check if currently blocked
    IF current_limit.blocked_until IS NOT NULL AND current_limit.blocked_until > now() THEN
        is_blocked := true;
        attempts_left := 0;
    ELSE
        -- Check if we're within the time window
        IF current_limit.first_attempt_at IS NULL OR 
           current_limit.first_attempt_at < (now() - (p_window_minutes || ' minutes')::interval) THEN
            -- Reset the counter
            UPDATE rate_limits 
            SET attempt_count = 1,
                first_attempt_at = now(),
                last_attempt_at = now(),
                blocked_until = NULL
            WHERE identifier = p_identifier AND action_type = p_action_type;
            attempts_left := p_max_attempts - 1;
        ELSE
            -- Increment the counter
            UPDATE rate_limits 
            SET attempt_count = attempt_count + 1,
                last_attempt_at = now(),
                blocked_until = CASE 
                    WHEN attempt_count + 1 >= p_max_attempts 
                    THEN now() + (p_block_minutes || ' minutes')::interval
                    ELSE NULL
                END
            WHERE identifier = p_identifier AND action_type = p_action_type;
            
            attempts_left := p_max_attempts - (current_limit.attempt_count + 1);
            if attempts_left <= 0 THEN
                is_blocked := true;
            END IF;
        END IF;
    END IF;
    
    -- If no record exists, create one
    IF current_limit.id IS NULL THEN
        INSERT INTO rate_limits (identifier, action_type, attempt_count, first_attempt_at, last_attempt_at)
        VALUES (p_identifier, p_action_type, 1, now(), now());
        attempts_left := p_max_attempts - 1;
    END IF;
    
    -- Return result
    result := jsonb_build_object(
        'is_blocked', is_blocked,
        'attempts_left', GREATEST(0, attempts_left),
        'blocked_until', current_limit.blocked_until
    );
    
    RETURN result;
END;
$$;

-- 6. Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
    p_event_type TEXT,
    p_user_id UUID DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_details JSONB DEFAULT NULL,
    p_severity TEXT DEFAULT 'medium'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO security_events (
        event_type, user_id, email, ip_address, user_agent, details, severity
    ) VALUES (
        p_event_type, p_user_id, p_email, p_ip_address, p_user_agent, p_details, p_severity
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$;

-- 7. Password complexity validation function
CREATE OR REPLACE FUNCTION public.validate_password_complexity(password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSONB;
    has_uppercase BOOLEAN := false;
    has_lowercase BOOLEAN := false;
    has_number BOOLEAN := false;
    has_special BOOLEAN := false;
    length_valid BOOLEAN := false;
    errors TEXT[] := '{}';
BEGIN
    -- Check length (minimum 12 characters for enhanced security)
    IF length(password) >= 12 THEN
        length_valid := true;
    ELSE
        errors := array_append(errors, 'La contraseña debe tener al menos 12 caracteres');
    END IF;
    
    -- Check for uppercase letter
    IF password ~ '[A-Z]' THEN
        has_uppercase := true;
    ELSE
        errors := array_append(errors, 'La contraseña debe contener al menos una letra mayúscula');
    END IF;
    
    -- Check for lowercase letter
    IF password ~ '[a-z]' THEN
        has_lowercase := true;
    ELSE
        errors := array_append(errors, 'La contraseña debe contener al menos una letra minúscula');
    END IF;
    
    -- Check for number
    IF password ~ '[0-9]' THEN
        has_number := true;
    ELSE
        errors := array_append(errors, 'La contraseña debe contener al menos un número');
    END IF;
    
    -- Check for special character
    IF password ~ '[^a-zA-Z0-9]' THEN
        has_special := true;
    ELSE
        errors := array_append(errors, 'La contraseña debe contener al menos un carácter especial');
    END IF;
    
    result := jsonb_build_object(
        'valid', length_valid AND has_uppercase AND has_lowercase AND has_number AND has_special,
        'errors', to_jsonb(errors),
        'requirements', jsonb_build_object(
            'length', length_valid,
            'uppercase', has_uppercase,
            'lowercase', has_lowercase,
            'number', has_number,
            'special', has_special
        )
    );
    
    RETURN result;
END;
$$;