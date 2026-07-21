import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { STAFF_ROLES, UserRole } from '../../types';

const ROLES = Object.entries(STAFF_ROLES) as [UserRole, typeof STAFF_ROLES[keyof typeof STAFF_ROLES]][];

const RoleSelectionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { setUserRole } = useAuth();
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    await setUserRole(selected);
    setLoading(false);
    navigation.reset({ index: 0, routes: [{ name: STAFF_ROLES[selected].homeScreen as never }] });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logoText}>
            <Text style={styles.logoClinic}>Clinic</Text>
            <Text style={styles.logoConnect}>Connect</Text>
          </Text>
          <Text style={styles.tagline}>Connecting Patients With Healthcare</Text>
        </View>

        <View style={styles.body}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Select your role</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Choose how you'll use ClinicConnect
          </Text>

          <View style={styles.grid}>
            {ROLES.map(([key, config]) => {
              const isSelected = selected === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.card,
                    {
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      backgroundColor: isSelected
                        ? theme.colors.primary + '10'
                        : theme.colors.surface,
                    },
                  ]}
                  onPress={() => setSelected(key)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor: isSelected
                          ? theme.colors.primary + '20'
                          : theme.colors.background,
                      },
                    ]}
                  >
                    <Ionicons
                      name={config.icon as keyof typeof Ionicons.glyphMap}
                      size={28}
                      color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
                    />
                  </View>
                  <Text style={[styles.cardLabel, { color: isSelected ? theme.colors.primary : theme.colors.text }]}>
                    {config.label}
                  </Text>
                  <Text style={[styles.cardDesc, { color: theme.colors.textSecondary }]}>
                    {config.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            title="Continue"
            onPress={handleContinue}
            loading={loading}
            disabled={!selected}
            style={styles.continueButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#d4b896',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },
  logoText: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  logoClinic: {
    color: '#1e2a3a',
  },
  logoConnect: {
    color: '#7a8c3a',
  },
  tagline: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#7a8c3a',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  card: {
    width: '47%',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  continueButton: {
    marginTop: 8,
  },
});

export default RoleSelectionScreen;
