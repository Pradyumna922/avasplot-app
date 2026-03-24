import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../theme';

interface PayUWebViewProps {
  visible: boolean;
  html: string;
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
  onFailure: (message: string) => void;
}

export const PayUWebView: React.FC<PayUWebViewProps> = ({
  visible,
  html,
  onClose,
  onSuccess,
  onFailure,
}) => {
  const [loading, setLoading] = React.useState(true);

  const onNavigationStateChange = (navState: any) => {
    const { url } = navState;
    if (url.includes('payment-success')) {
      // Extract payment ID from URL if needed, or just assume success
      const paymentId = url.split('txnid=')[1]?.split('&')[0] || `payu_${Date.now()}`;
      onSuccess(paymentId);
    } else if (url.includes('payment-failure')) {
      onFailure('Payment was not successful (URL match).');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Secure Payment</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* WebView */}
        <View style={{ flex: 1 }}>
          <WebView
            source={{ html }}
            onNavigationStateChange={onNavigationStateChange}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            style={{ flex: 1 }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Connecting to Secure Gateway...</Text>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: '#F8FAFC',
  },
  closeBtn: { padding: 8 },
  title: { ...Typography.bodyBold, color: Colors.text, fontSize: 16 },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    gap: Spacing.md,
  },
  loadingText: { ...Typography.caption, color: Colors.textMuted },
});
