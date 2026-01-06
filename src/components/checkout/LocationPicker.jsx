import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2 } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageContext';
import { toast } from 'sonner';

export default function LocationPicker({ onLocationSelect }) {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error(language === 'np' ? 'स्थान समर्थित छैन' : 'Location not supported');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use OpenStreetMap Nominatim for reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          
          const locationData = {
            latitude,
            longitude,
            municipality: data.address?.city || data.address?.town || data.address?.village || '',
            ward: data.address?.suburb || '',
            area: data.address?.neighbourhood || data.address?.road || '',
            landmark: data.address?.amenity || '',
            fullAddress: data.display_name || ''
          };

          onLocationSelect(locationData);
          toast.success(language === 'np' ? 'स्थान प्राप्त भयो' : 'Location detected');
        } catch (error) {
          toast.error(language === 'np' ? 'स्थान प्राप्त गर्न सकिएन' : 'Could not get address');
          onLocationSelect({
            latitude,
            longitude,
            municipality: '',
            ward: '',
            area: '',
            landmark: '',
            fullAddress: `${latitude}, ${longitude}`
          });
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error(language === 'np' ? 'स्थान अनुमति अस्वीकार' : 'Location permission denied');
        } else {
          toast.error(language === 'np' ? 'स्थान प्राप्त गर्न सकिएन' : 'Could not get location');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGetLocation}
      disabled={loading}
      className="w-full border-red-200 hover:bg-red-50"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {language === 'np' ? 'स्थान खोज्दै...' : 'Getting location...'}
        </>
      ) : (
        <>
          <MapPin className="w-4 h-4 mr-2" />
          {language === 'np' ? 'मेरो स्थान प्रयोग गर्नुहोस्' : 'Use My Location'}
        </>
      )}
    </Button>
  );
}