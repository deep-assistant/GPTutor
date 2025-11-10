import { FC } from 'react';
import { Card, Cell, Avatar, Title, Text, Badge } from '@vkontakte/vkui';

interface ModelCardProps {
  name: string;
  provider: string;
  tokens: string;
  latency: string;
  growth: string;
}

export const ModelCard: FC<ModelCardProps> = ({ name, provider, tokens, latency, growth }) => {
  return (
    <Card style={{ marginBottom: '12px' }}>
      <Cell
        before={<Avatar size={40} style={{ backgroundColor: 'var(--vkui--color_accent_blue)' }} />}
        after={
          <div style={{ textAlign: 'right' }}>
            <Text style={{ fontSize: '12px', color: 'var(--vkui--color_text_secondary)' }}>
              {tokens} токенов/нед
            </Text>
            <Text style={{ fontSize: '12px', color: 'var(--vkui--color_text_secondary)' }}>
              {latency} задержка
            </Text>
          </div>
        }
      >
        <div>
          <Title level="3" style={{ marginBottom: '4px' }}>
            {name}
          </Title>
          <Text style={{ fontSize: '14px', color: 'var(--vkui--color_text_secondary)' }}>
            от {provider}
          </Text>
          <Badge mode="prominent" style={{ marginTop: '4px' }}>
            {growth}
          </Badge>
        </div>
      </Cell>
    </Card>
  );
};













