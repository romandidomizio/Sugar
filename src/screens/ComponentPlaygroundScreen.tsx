import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme, Text, Divider, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { PaperButton } from '../components/paper';
import { PaperCard } from '../components/paper';
import { PaperInput } from '../components/paper';
import { PaperModal } from '../components/paper';

const { height } = Dimensions.get('window');

const ComponentPlaygroundScreen: React.FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const [modalVisible, setModalVisible] = React.useState(false);

  return (
    <KeyboardAwareScrollView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background }
      ]}
      contentContainerStyle={styles.contentContainer}
      extraScrollHeight={50}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
    >
      <Text
        variant="headlineLarge"
        style={[
          styles.title,
          { color: theme.colors.primary }
        ]}
      >
        Component Playground
      </Text>

      <Divider />

      <Surface
        elevation={1}
        style={[
          styles.navigationSection,
          {
            backgroundColor: theme.colors.primaryLight + '20',
            borderColor: theme.colors.primary
          }
        ]}
      >
        <Text style={styles.navigationTitle}>Screen Navigation</Text>
        <View style={styles.buttonRow}>
          <PaperButton
            variant="primary"
            size="small"
            onPress={() => navigation.navigate('Loading')}
          >
            Loading
          </PaperButton>

          <PaperButton
            variant="primary"
            size="small"
            onPress={() => navigation.navigate('Welcome')}
          >
            Welcome
          </PaperButton>

          <PaperButton
            variant="primary"
            size="small"
            onPress={() => navigation.navigate('Login')}
          >
            Login
          </PaperButton>

          <PaperButton
            variant="secondary"
            size="small"
            onPress={() => navigation.navigate('Register')}
          >
            Register
          </PaperButton>

          <PaperButton
            variant="tertiary"
            size="small"
            onPress={() => navigation.navigate('Home')}
          >
            Home
          </PaperButton>

          <PaperButton
            variant="tertiary"
            size="small"
            onPress={() => navigation.navigate('Cart')}
          >
            Cart
          </PaperButton>
        </View>
      </Surface>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={styles.sectionTitle}>Button Variants</Text>

        <PaperButton
          variant="primary"
          width="full"
          onPress={() => console.log('Primary Button Pressed')}
        >
          Primary Full Width Button
        </PaperButton>

        <View style={styles.buttonRow}>
          <PaperButton
            variant="secondary"
            size="small"
            onPress={() => console.log('Small Secondary Button Pressed')}
          >
            Small
          </PaperButton>

          <PaperButton
            variant="secondary"
            onPress={() => console.log('Default Secondary Button Pressed')}
          >
            Default
          </PaperButton>

          <PaperButton
            variant="secondary"
            size="large"
            onPress={() => console.log('Large Secondary Button Pressed')}
          >
            Large
          </PaperButton>
        </View>

        <View style={styles.buttonRow}>
          <PaperButton
            variant="tertiary"
            size="small"
            onPress={() => console.log('Small Tertiary Button Pressed')}
          >
            Small
          </PaperButton>

          <PaperButton
            variant="tertiary"
            onPress={() => console.log('Default Tertiary Button Pressed')}
          >
            Default
          </PaperButton>

          <PaperButton
            variant="tertiary"
            size="large"
            onPress={() => console.log('Large Tertiary Button Pressed')}
          >
            Large
          </PaperButton>
        </View>

        <PaperButton
          variant="danger"
          onPress={() => console.log('Danger Button Pressed')}
        >
          Danger Button
        </PaperButton>

        <PaperButton
          variant="primary"
          disabled
          onPress={() => console.log('Disabled Button Pressed')}
        >
          Disabled Button
        </PaperButton>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={styles.sectionTitle}>Input Variants</Text>

        <PaperInput
          label="Standard Input"
          placeholder="Enter text"
        />

        <PaperInput
          label="Input with Error"
          error="This field is required"
        />
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={styles.sectionTitle}>Modal Example</Text>

        <PaperButton
          variant="tertiary"
          size="small"
          onPress={() => setModalVisible(true)}
        >
          Open Modal
        </PaperButton>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={styles.sectionTitle}>Card Example</Text>

        <PaperCard
          title="Sample Card"
          subtitle="This is a sample card component"
          content="React Native Paper provides flexible and customizable card components that can be used in various scenarios."
          actions={
            <PaperButton variant="tertiary" size="small">
              Learn More
            </PaperButton>
          }
        />
      </View>

      <PaperModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        title="Component Playground Modal"
        content="This is an example of a Paper Modal component with dynamic theming."
        confirmText="Close"
        onConfirm={() => setModalVisible(false)}
      />
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginVertical: 16,
  },
  section: {
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  navigationSection: {
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  navigationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
});

export default ComponentPlaygroundScreen;
