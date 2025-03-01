import React from 'react';
import { Modal, Portal, Text, Button } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

interface PaperModalProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  content: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

const PaperModal: React.FC<PaperModalProps> = ({
  visible,
  onDismiss,
  title,
  content,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm
}) => {
  return (
    <Portal>
      <Modal 
        visible={visible} 
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text variant="headlineSmall" style={styles.title}>
            {title}
          </Text>
          <Text variant="bodyMedium" style={styles.content}>
            {content}
          </Text>
          <View style={styles.buttonContainer}>
            <Button 
              mode="text" 
              onPress={onDismiss}
              style={styles.button}
            >
              {cancelText}
            </Button>
            {onConfirm && (
              <Button 
                mode="contained" 
                onPress={() => {
                  onConfirm();
                  onDismiss();
                }}
                style={styles.button}
              >
                {confirmText}
              </Button>
            )}
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  modalContent: {
    alignItems: 'center',
  },
  title: {
    marginBottom: 15,
    textAlign: 'center',
  },
  content: {
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    marginHorizontal: 10,
  },
});

export default PaperModal;
