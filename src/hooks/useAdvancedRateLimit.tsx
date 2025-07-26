import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RateLimitConfig {
  maxAttempts: number;
  windowMinutes: number;
  blockMinutes: number;
}

interface RateLimitResult {
  isBlocked: boolean;
  attemptsLeft: number;
  blockedUntil?: Date;
}

const defaultConfigs: Record<string, RateLimitConfig> = {
  login: { maxAttempts: 5, windowMinutes: 15, blockMinutes: 30 },
  signup: { maxAttempts: 3, windowMinutes: 60, blockMinutes: 60 },
  password_reset: { maxAttempts: 3, windowMinutes: 60, blockMinutes: 60 },
  api_sensitive: { maxAttempts: 10, windowMinutes: 1, blockMinutes: 5 },
  file_upload: { maxAttempts: 20, windowMinutes: 60, blockMinutes: 15 }
};

export const useAdvancedRateLimit = () => {
  const [isChecking, setIsChecking] = useState(false);

  const checkRateLimit = useCallback(async (
    identifier: string,
    actionType: string,
    customConfig?: Partial<RateLimitConfig>
  ): Promise<RateLimitResult> => {
    setIsChecking(true);
    
    try {
      const config = { ...defaultConfigs[actionType], ...customConfig };
      
      if (!config.maxAttempts) {
        throw new Error(`Unknown action type: ${actionType}`);
      }

      const { data, error } = await supabase.rpc('check_rate_limit', {
        p_identifier: identifier,
        p_action_type: actionType,
        p_max_attempts: config.maxAttempts,
        p_window_minutes: config.windowMinutes,
        p_block_minutes: config.blockMinutes
      });

      if (error) {
        console.warn('Rate limit check failed:', error);
        // Fallback to local rate limiting
        return await localRateLimit(identifier, actionType, config);
      }

      const result = data as any;
      return {
        isBlocked: result.is_blocked || false,
        attemptsLeft: Math.max(0, result.attempts_left || 0),
        blockedUntil: result.blocked_until ? new Date(result.blocked_until) : undefined
      };
    } catch (error) {
      console.warn('Rate limit check error:', error);
      // Fallback to local rate limiting
      const config = { ...defaultConfigs[actionType], ...customConfig };
      return await localRateLimit(identifier, actionType, config);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const logSecurityEvent = useCallback(async (
    eventType: string,
    email?: string,
    details?: any,
    severity: string = 'medium'
  ) => {
    try {
      await supabase.rpc('log_security_event', {
        p_event_type: eventType,
        p_email: email,
        p_details: details,
        p_severity: severity
      });
    } catch (error) {
      console.warn('Failed to log security event:', error);
    }
  }, []);

  // Fallback local rate limiting
  const localRateLimit = async (
    identifier: string,
    actionType: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> => {
    const now = Date.now();
    const key = `rate_limit_${actionType}_${identifier}`;
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      localStorage.setItem(key, JSON.stringify({
        count: 1,
        firstAttempt: now,
        lastAttempt: now
      }));
      return { isBlocked: false, attemptsLeft: config.maxAttempts - 1 };
    }

    const data = JSON.parse(stored);
    const windowMs = config.windowMinutes * 60 * 1000;
    
    // Check if window has expired
    if (now - data.firstAttempt > windowMs) {
      localStorage.setItem(key, JSON.stringify({
        count: 1,
        firstAttempt: now,
        lastAttempt: now
      }));
      return { isBlocked: false, attemptsLeft: config.maxAttempts - 1 };
    }

    // Increment counter
    const newCount = data.count + 1;
    localStorage.setItem(key, JSON.stringify({
      ...data,
      count: newCount,
      lastAttempt: now
    }));

    if (newCount >= config.maxAttempts) {
      const blockedUntil = new Date(now + config.blockMinutes * 60 * 1000);
      return { isBlocked: true, attemptsLeft: 0, blockedUntil };
    }

    return { isBlocked: false, attemptsLeft: config.maxAttempts - newCount };
  };

  return {
    checkRateLimit,
    logSecurityEvent,
    isChecking
  };
};

export default useAdvancedRateLimit;