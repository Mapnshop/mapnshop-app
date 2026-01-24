import React from 'react';
import { View, Modal, Image, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { X, Trash2 } from 'lucide-react-native';
import { Button } from '@/components/Button';

interface ImageViewerModalProps {
    visible: boolean;
    imageUrl: string | null;
    onClose: () => void;
    onDelete?: () => void; // Optional, if user has permission to delete
}

const { width, height } = Dimensions.get('window');

export const ImageViewerModal = ({ visible, imageUrl, onClose, onDelete }: ImageViewerModalProps) => {
    if (!imageUrl) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    resizeMode="contain"
                />

                {/* Header Controls */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.iconButton}>
                        <X size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Footer Controls */}
                {onDelete && (
                    <View style={styles.footer}>
                        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                            <Trash2 size={24} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: width,
        height: height,
    },
    header: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 20,
        right: 20,
        zIndex: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        right: 20,
        zIndex: 10,
    },
    iconButton: {
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
    },
    deleteButton: {
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.5)',
    },
});
