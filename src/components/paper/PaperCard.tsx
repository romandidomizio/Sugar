import React from 'react';
import { Card, CardProps, Text } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

interface SugarCardProps extends Omit<CardProps, 'children'> {
  title: string;
  subtitle?: string;
  content: string;
  imageUri?: string;
  actions?: React.ReactNode;
}

const PaperCard: React.FC<SugarCardProps> = ({
  title,
  subtitle,
  content,
  imageUri,
  actions,
  ...props
}) => {
  return (
    <Card {...props} style={[styles.card, props.style]}>
      {imageUri && <Card.Cover source={{ uri: imageUri }} />}
      <Card.Content>
        <Text variant="titleLarge">{title}</Text>
        {subtitle && <Text variant="bodyMedium">{subtitle}</Text>}
        <Text variant="bodyMedium" style={styles.content}>
          {content}
        </Text>
      </Card.Content>
      {actions && (
        <Card.Actions>
          {actions}
        </Card.Actions>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
  },
  content: {
    marginTop: 8,
  },
});

export default PaperCard;
