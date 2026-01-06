import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Phone, ShoppingBag, Truck, Clock } from 'lucide-react-native';
import { useLanguage } from '../providers/LanguageProvider';
import { colors, gradients } from '../theme/colors';
import { spacing, borderRadius, fontSize, fontWeight, shadows } from '../theme';

export default function HomeScreen() {
  const { t } = useLanguage();
  
  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <LinearGradient
        colors={['#faf5ff', '#fdf2f8', '#fff7ed']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}
      >
        <View style={styles.heroContent}>
          {/* Service Badge */}
          <View style={styles.badge}>
            <LinearGradient
              colors={gradients.primaryLight}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.badgeGradient}
            >
              <Text style={styles.badgeText}>🎉 {t('servingDang')}</Text>
            </LinearGradient>
          </View>
          
          {/* Hero Title */}
          <Text style={styles.heroTitle}>
            Fresh Groceries{'\n'}
            <Text style={styles.heroGradientText}>Delivered Fast</Text>
          </Text>
          
          <Text style={styles.heroDescription}>
            Your trusted local marketplace for groceries, dairy, bakery items, and furniture.
          </Text>
          
          {/* CTA Button */}
          <TouchableOpacity activeOpacity={0.8}>
            <LinearGradient
              colors={gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaButton}
            >
              <Text style={styles.ctaButtonText}>Shop Now →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      {/* Features Grid */}
      <View style={styles.featuresContainer}>
        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: colors.purple[100] }]}>
            <Truck color={colors.purple[600]} size={24} />
          </View>
          <Text style={styles.featureTitle}>Fast Delivery</Text>
          <Text style={styles.featureDescription}>Same-day delivery across Dang Valley</Text>
        </View>
        
        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: colors.pink[100] }]}>
            <ShoppingBag color={colors.pink[600]} size={24} />
          </View>
          <Text style={styles.featureTitle}>Quality Products</Text>
          <Text style={styles.featureDescription}>Fresh and locally sourced items</Text>
        </View>
        
        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: colors.orange[100] }]}>
            <Clock color={colors.orange[600]} size={24} />
          </View>
          <Text style={styles.featureTitle}>24/7 Support</Text>
          <Text style={styles.featureDescription}>Always here to help you</Text>
        </View>
      </View>
      
      {/* Contact Info */}
      <View style={styles.contactSection}>
        <View style={styles.contactItem}>
          <MapPin color={colors.gray[600]} size={20} />
          <Text style={styles.contactText}>Serving Dang Valley</Text>
        </View>
        <View style={styles.contactItem}>
          <Phone color={colors.gray[600]} size={20} />
          <Text style={styles.contactText}>+977-9800000000</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  heroSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxxl,
    paddingTop: spacing.xxl,
  },
  heroContent: {
    alignItems: 'flex-start',
  },
  badge: {
    marginBottom: spacing.md,
  },
  badgeGradient: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.md,
  },
  badgeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.purple[700],
  },
  heroTitle: {
    fontSize: fontSize.xxxxl,
    fontWeight: fontWeight.black,
    color: colors.gray[900],
    marginBottom: spacing.md,
    lineHeight: fontSize.xxxxl * 1.2,
  },
  heroGradientText: {
    color: colors.purple[600],
  },
  heroDescription: {
    fontSize: fontSize.base,
    color: colors.gray[700],
    marginBottom: spacing.xl,
    lineHeight: fontSize.base * 1.5,
    fontWeight: fontWeight.medium,
  },
  ctaButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    ...shadows.xl,
  },
  ctaButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
  },
  featuresContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  featureCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...shadows.sm,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    lineHeight: fontSize.sm * 1.5,
  },
  contactSection: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  contactText: {
    fontSize: fontSize.base,
    color: colors.gray[700],
    fontWeight: fontWeight.medium,
  },
});
