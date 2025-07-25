import React from 'react';

interface PasswordRequirement {
  met: boolean;
  text: string;
}

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showRequirements = true
}) => {
  const requirements: PasswordRequirement[] = [
    {
      met: password.length >= 12,
      text: 'Al menos 12 caracteres'
    },
    {
      met: /[A-Z]/.test(password),
      text: 'Una letra mayúscula'
    },
    {
      met: /[a-z]/.test(password),
      text: 'Una letra minúscula'
    },
    {
      met: /[0-9]/.test(password),
      text: 'Un número'
    },
    {
      met: /[^a-zA-Z0-9]/.test(password),
      text: 'Un carácter especial'
    }
  ];

  const metRequirements = requirements.filter(req => req.met).length;
  const strength = metRequirements / requirements.length;

  const getStrengthColor = () => {
    if (strength < 0.4) return 'bg-destructive';
    if (strength < 0.8) return 'bg-warning';
    return 'bg-success';
  };

  const getStrengthText = () => {
    if (strength < 0.4) return 'Débil';
    if (strength < 0.8) return 'Media';
    return 'Fuerte';
  };

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Seguridad de la contraseña:</span>
        <span className={`font-medium ${
          strength < 0.4 ? 'text-destructive' : 
          strength < 0.8 ? 'text-warning' : 
          'text-success'
        }`}>
          {getStrengthText()}
        </span>
      </div>
      
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
          style={{ width: `${strength * 100}%` }}
        />
      </div>

      {showRequirements && (
        <div className="space-y-1">
          {requirements.map((requirement, index) => (
            <div key={index} className="flex items-center text-xs">
              <div className={`w-3 h-3 rounded-full mr-2 flex items-center justify-center ${
                requirement.met ? 'bg-success' : 'bg-muted'
              }`}>
                {requirement.met && (
                  <svg className="w-2 h-2 text-success-foreground" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className={requirement.met ? 'text-success' : 'text-muted-foreground'}>
                {requirement.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;