import { FC } from 'react';
import { Card, Title, Text } from '@vkontakte/vkui';

interface StatsCardProps {
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  value: string;
  label: string;
}

export const StatsCard: FC<StatsCardProps> = ({ icon: Icon, value, label }) => {
  return (
    <Card style={{ textAlign: 'center', padding: '20px' }}>
      <Icon style={{ fontSize: '32px', marginBottom: '8px', color: 'var(--vkui--color_accent_blue)' }} />
      <Title level="2" style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>
        {value}
      </Title>
      <Text style={{ fontSize: '14px', color: 'var(--vkui--color_text_secondary)' }}>
        {label}
      </Text>
    </Card>
  );
};













