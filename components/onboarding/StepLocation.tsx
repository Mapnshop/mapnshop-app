import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { Layout } from '@/constants/Layout';

interface StepLocationProps {
    address: string;
    onSelectAddress: (data: { address: string; lat: number; lng: number }) => void;
}

export function StepLocation({ address, onSelectAddress }: StepLocationProps) {
    return (
        <View style={{ zIndex: 100, marginBottom: Layout.spacing.md }}>
            <AddressAutocomplete
                label="Business Address *"
                placeholder="Search for your business location"
                defaultValue={address}
                onSelect={onSelectAddress}
            />
        </View>
    );
}
