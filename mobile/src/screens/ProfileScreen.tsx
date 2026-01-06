import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Phone, MapPin, LogOut, ChevronRight, Heart, ShoppingBag, Settings } from 'lucide-react-native';
import { useLanguage } from '../providers/LanguageProvider';
import { useAuth } from '../providers/AuthProvider';
import { colors, gradients } from '../theme/colors';
import { spacing, borderRadius, fontSize, fontWeight, shadows } from '../theme';

export default function ProfileScreen() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: ShoppingBag, label: 'My Orders', color: colors.purple[600] },
    { icon: Heart, label: 'Wishlist', color: colors.pink[600] },
    { icon: MapPin, label: 'Saved Addresses', color: colors.orange[600] },
    { icon: Settings, label: 'Settings', color: colors.gray[600] },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <User color={colors.white} size={32} />
          </View>
          <View style={styles.userInfo}>
            {user ? (
              <>
                <Text style={styles.userName}>{user.full_name || user.email}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </>
            ) : (
              <Text style={styles.userName}>Guest User</Text>
            )}
          </View>
        </View>
      </LinearGradient>
      
      {/* Content */}
      <ScrollView style={styles.scrollView}>
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Mail color={colors.gray[600]} size={20} />
                <Text style={styles.infoText}>{user.email}</Text>
              </View>
              {user.phone_number && (
                <View style={styles.infoRow}>
                  <Phone color={colors.gray[600]} size={20} />
                  <Text style={styles.infoText}>{user.phone_number}</Text>
                </View>
              )}
            </View>
          </View>
        )}
        
        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.card}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index !== menuItems.length - 1 && styles.menuItemBorder,
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
                    <item.icon color={item.color} size={20} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <ChevronRight color={colors.gray[400]} size={20} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Logout Button */}
        {user && (
          <View style={styles.section}>
            <TouchableOpacity onPress={logout} activeOpacity={0.8}>
              <LinearGradient
                colors={[colors.red[600], colors.red[700]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.logoutButton}
              >
                <LogOut color={colors.white} size={20} />
                <Text style={styles.logoutButtonText}>Logout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('madeWithLove')}</Text>
          <Text style={styles.footerSubtext}>© 2024 Dang Bazaar. {t('allRightsReserved')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    ...shadows.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white + '30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: fontSize.base,
    color: colors.white,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.gray[700],
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  infoText: {
    fontSize: fontSize.base,
    color: colors.gray[700],
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.gray[900],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  logoutButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  footer: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    textAlign: 'center',
  },
});
