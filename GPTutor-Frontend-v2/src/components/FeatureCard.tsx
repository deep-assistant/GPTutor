import { FC } from 'react';
import { Card, Cell, Title, Text } from '@vkontakte/vkui';

interface FeatureCardProps {
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  title: string;
  description: string;
}

export const FeatureCard: FC<FeatureCardProps> = ({ icon: Icon, title, description }) => {
  return (
    <Card style={{ marginBottom: '16px' }}>
      <Cell
        before={<Icon style={{ fontSize: '24px', color: 'var(--vkui--color_accent_blue)' }} />}
      >
        <div>
          <Title level="3" style={{ marginBottom: '8px' }}>
            {title}
          </Title>
          <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
            {description}
          </Text>
        </div>
      </Cell>
    </Card>
  );
};













