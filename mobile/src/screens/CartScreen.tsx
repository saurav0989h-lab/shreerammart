import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../providers/LanguageProvider';

export default function CartScreen() {
  const { t } = useLanguage();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('cart')}</Text>
      <Text>Your cart will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
});
