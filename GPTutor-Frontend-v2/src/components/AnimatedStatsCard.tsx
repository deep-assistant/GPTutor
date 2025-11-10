import { FC, useState, useEffect } from 'react';
import { Card, Title, Text } from '@vkontakte/vkui';

interface AnimatedStatsCardProps {
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  value: string;
  label: string;
  delay?: number;
}

export const AnimatedStatsCard: FC<AnimatedStatsCardProps> = ({ 
  icon: Icon, 
  value, 
  label, 
  delay = 0 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Card 
      style={{ 
        textAlign: 'center', 
        padding: '20px',
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.6s ease-out',
        boxShadow: isVisible ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none'
      }}
    >
      <Icon style={{ 
        fontSize: '32px', 
        marginBottom: '8px', 
        color: 'var(--vkui--color_accent_blue)',
        transform: isVisible ? 'scale(1)' : 'scale(0.8)',
        transition: 'transform 0.4s ease-out'
      }} />
      <Title level="2" style={{ 
        fontSize: '32px', 
        fontWeight: 'bold', 
        marginBottom: '4px',
        color: isVisible ? 'var(--vkui--color_text_primary)' : 'transparent',
        transition: 'color 0.3s ease-out'
      }}>
        {value}
      </Title>
      <Text style={{ 
        fontSize: '14px', 
        color: 'var(--vkui--color_text_secondary)',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.4s ease-out'
      }}>
        {label}
      </Text>
    </Card>
  );
};











