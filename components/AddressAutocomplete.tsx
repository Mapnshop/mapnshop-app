import React, { forwardRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '';

interface AddressAutocompleteProps {
    label?: string;
    placeholder?: string;
    onSelect: (data: { address: string; lat: number; lng: number }) => void;
    defaultValue?: string;
}

interface Prediction {
    description: string;
    place_id: string;
}

export const AddressAutocomplete = forwardRef<any, AddressAutocompleteProps>(({
    label,
    placeholder = "Search address...",
    onSelect,
    defaultValue
}, ref) => {
    const [query, setQuery] = useState(defaultValue || '');
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [loading, setLoading] = useState(false);
    const [showPredictions, setShowPredictions] = useState(false);

    useEffect(() => {
        if (Platform.OS === 'web') {
            const loadScript = () => {
                const existingScript = document.getElementById('googleMapsScript');
                if (existingScript) return; // Script already added

                if ((window as any).google) return; // Google already loaded

                if (!GOOGLE_API_KEY) {
                    console.warn("AddressAutocomplete: Missing Google API Key");
                    return;
                }

                const script = document.createElement('script');
                script.id = 'googleMapsScript';
                script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
                script.async = true;
                script.defer = true;
                script.onload = () => console.log("Google Maps Script Loaded");
                script.onerror = (e) => console.error("Google Maps Script Failed to Load", e);
                document.head.appendChild(script);
            };
            loadScript();
        }
    }, []);

    // Debounce logic could be added here, but for simplicity we'll just fetch on change
    // In a production app, use useDebounce

    const fetchPredictions = async (text: string) => {
        if (!text || text.length < 3) {
            setPredictions([]);
            setShowPredictions(false);
            return;
        }

        setLoading(true);

        try {
            if (Platform.OS === 'web') {
                // Web: Use Google Maps JS SDK
                if ((window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
                    const service = new (window as any).google.maps.places.AutocompleteService();
                    service.getPlacePredictions({ input: text }, (predictions: any[], status: any) => {
                        if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && predictions) {
                            setPredictions(predictions.map(p => ({
                                description: p.description,
                                place_id: p.place_id,
                            })));
                            setShowPredictions(true);
                        } else {
                            console.log('Google Places API returned no results or error:', status);
                            setPredictions([]);
                        }
                        setLoading(false);
                    });
                } else {
                    console.warn('Google Maps JS API not loaded or missing libraries=places');
                    setLoading(false);
                }
            } else {
                // Native: Use REST API
                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${GOOGLE_API_KEY}&language=en`
                );
                const data = await response.json();
                if (data.status === 'OK') {
                    setPredictions(data.predictions);
                    setShowPredictions(true);
                } else {
                    setPredictions([]);
                }
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching places:', error);
            setPredictions([]);
            setLoading(false);
        }
    };

    const handleSelect = async (placeId: string, description: string) => {
        setQuery(description);
        setShowPredictions(false);

        // Fetch details (lat/lng)
        try {
            if (Platform.OS === 'web') {
                if (typeof window !== 'undefined' && (window as any).google) {
                    const geocoder = new (window as any).google.maps.Geocoder();
                    geocoder.geocode({ placeId: placeId }, (results: any[], status: any) => {
                        if (status === 'OK' && results[0]) {
                            const location = results[0].geometry.location;
                            onSelect({
                                address: description,
                                lat: location.lat(),
                                lng: location.lng(),
                            });
                        }
                    });
                }
            } else {
                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${GOOGLE_API_KEY}`
                );
                const data = await response.json();
                if (data.status === 'OK') {
                    onSelect({
                        address: description,
                        lat: data.result.geometry.location.lat,
                        lng: data.result.geometry.location.lng,
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching details:', error);
        }
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    placeholder={placeholder}
                    value={query}
                    onChangeText={(text) => {
                        setQuery(text);
                        fetchPredictions(text);
                    }}
                    placeholderTextColor="#9CA3AF"
                />
                {loading && (
                    <ActivityIndicator style={styles.loader} color="#3B82F6" size="small" />
                )}
            </View>

            {showPredictions && predictions.length > 0 && (
                <View style={styles.listView}>
                    <FlatList
                        data={predictions}
                        keyExtractor={(item) => item.place_id}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.row}
                                onPress={() => handleSelect(item.place_id, item.description)}
                            >
                                <Text style={styles.description}>{item.description}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        zIndex: 1000,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 6,
    },
    inputContainer: {
        justifyContent: 'center',
    },
    textInput: {
        backgroundColor: '#FFFFFF',
        height: 44,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#111827',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    loader: {
        position: 'absolute',
        right: 12,
    },
    listView: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        maxHeight: 200,
        zIndex: 1000,
    },
    row: {
        padding: 13,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    description: {
        fontSize: 14,
        color: '#4B5563',
    },
});
