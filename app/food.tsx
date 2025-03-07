import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import {
  Ionicons,
  Feather,
  EvilIcons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Dropdown } from 'react-native-element-dropdown';
import { useFonts, Figtree_400Regular } from '@expo-google-fonts/figtree';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

// Import the Theme hook
import { useTheme } from '../ThemeProvider';

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const FoodScreen: React.FC = () => {
  const navigation = useNavigation();
  const theme = useTheme(); // <- get current theme

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission for notifications was not granted!');
      }
    })();

    const fetchMealTimes = async () => {
      try {
        const savedData = await AsyncStorage.getItem('mealTimes');
        if (savedData) {
          setTimeList(JSON.parse(savedData));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchMealTimes();
  }, []);

  const [mealTimeDropdownValue, setMealTimeDropdownValue] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [tempTime, setTempTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeList, setTimeList] = useState<{ label: string; time: string }[]>([]);

  const [fontsLoaded] = useFonts({ Figtree: Figtree_400Regular });
  if (!fontsLoaded) return null;

  const formatCustomTime = (time: Date) => {
    let hours = time.getHours();
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return { timeString: `${hours} : ${minutes}`, period };
  };

  const computeNextOccurrence = (): Date => {
    const now = new Date();
    const next = new Date(now);
    next.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    return next;
  };

  const handleAddTime = async () => {
    if (!mealTimeDropdownValue) return;
    const { timeString, period } = formatCustomTime(startTime);
    const newEntry = { label: mealTimeDropdownValue, time: `${timeString} ${period}` };

    const updatedList = [...timeList, newEntry];
    setTimeList(updatedList);

    try {
      await AsyncStorage.setItem('mealTimes', JSON.stringify(updatedList));
    } catch (error) {
      console.error('Error saving data:', error);
    }

    const nextOccurrence = computeNextOccurrence();
    console.log('Scheduling notification for:', nextOccurrence.toString());

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Meal Reminder',
          body: `It's time for ${mealTimeDropdownValue}!`,
          sound: true,
        },
        trigger: nextOccurrence,
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const handleRemoveTime = async (index: number) => {
    const updatedList = timeList.filter((_, i) => i !== index);
    setTimeList(updatedList);

    try {
      await AsyncStorage.setItem('mealTimes', JSON.stringify(updatedList));
    } catch (error) {
      console.error('Error removing data:', error);
    }
  };

  const handleClearTimes = async () => {
    setTimeList([]);
    try {
      await AsyncStorage.removeItem('mealTimes');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  const onChangeTime = (event: any, selectedDate: Date | undefined) => {
    if (selectedDate) {
      setTempTime(selectedDate);
    }
  };

  const handleDoneTimePicker = () => {
    setStartTime(tempTime);
    setShowTimePicker(false);
  };

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={wp(7)} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleClearTimes}>
          <EvilIcons name="trash" size={wp(8)} color="red" />
        </TouchableOpacity>
      </View>

      <View style={styles.watercontainer}>
        <MaterialCommunityIcons
          name="hamburger"
          size={wp(15)}
          color="#FF9613"
        />
        <Text style={[styles.title, { color: theme.text }]}>Food</Text>
      </View>

      {/* Meal Time Dropdown */}
      <View style={styles.mealDropdownContainer}>
        <Dropdown
          style={[
            styles.dropdownContainer,
            {
              backgroundColor: theme.buttonBackground,
              borderColor: theme.border,
            },
          ]}
          /* The container for the opened list */
          containerStyle={[
            styles.dropdownOpenedContainer,
            {
              backgroundColor: theme.background,
            },
          ]}
          placeholderStyle={{ color: theme.text }}
          selectedTextStyle={{
            color: theme.text,
            textAlign: 'center',
            flex: 1,
            alignSelf: 'center',
            textAlignVertical: 'center',
          }}
          itemTextStyle={{ color: theme.text }}
          data={[
            { label: 'Pre-Breakfast', value: 'Pre-Breakfast' },
            { label: 'Breakfast', value: 'Breakfast' },
            { label: 'Mid-Morning Snack', value: 'Mid-Morning Snack' },
            { label: 'Lunch', value: 'Lunch' },
            { label: 'Post-Lunch', value: 'Post-Lunch' },
            { label: 'Afternoon Snack', value: 'Afternoon Snack' },
            { label: 'Evening Snack', value: 'Evening Snack' },
            { label: 'Dinner', value: 'Dinner' },
            { label: 'Post-Dinner', value: 'Post-Dinner' },
            { label: 'Midnight Snack', value: 'Midnight Snack' },
          ]}
          labelField="label"
          valueField="value"
          placeholder="Select Meal Time"
          value={mealTimeDropdownValue}
          onChange={(item) => setMealTimeDropdownValue(item.value)}
          renderLeftIcon={() => (
            <Ionicons
              name="calendar-outline"
              size={25}
              color={theme.text}
              style={styles.leftIcon}
            />
          )}
        />
      </View>

      {/* Time Selector */}
      <View style={styles.mealDropdownContainer}>
        <TouchableOpacity
          style={[
            styles.dropdownContainer,
            {
              backgroundColor: theme.buttonBackground,
              borderColor: theme.border,
            },
          ]}
          onPress={() => setShowTimePicker(true)}
        >
          <Ionicons
            name="time-outline"
            size={25}
            color={theme.text}
            style={styles.leftIcon}
          />
          <Text style={{ color: theme.text, flex: 1, textAlign: 'center' }}>Time</Text>
          <Ionicons
            name="chevron-down-outline"
            size={25}
            color={theme.text}
            style={styles.leftIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Time Picker Modal */}
      <Modal visible={showTimePicker} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <DateTimePicker
              value={tempTime}
              mode="time"
              display="spinner"
              onChange={onChangeTime}
              style={{ width: '100%' }}
            />
            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: '#0B82FF' }]}
              onPress={handleDoneTimePicker}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Time Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={[styles.saveTimeButton, { backgroundColor: '#0B82FF' }]}
          onPress={handleAddTime}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" style={styles.addIcon} />
          <Text style={styles.saveTimeButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* List of Times */}
      <View style={styles.timeList}>
        {timeList.map((item, index) => (
          <View
            key={index}
            style={[
              styles.timeListItem,
              {
                borderColor: theme.border,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="hamburger"
              size={24}
              color="#FF9613"
            />
            <Text style={[styles.timeListText, { color: theme.text }]}>
              {item.label}
            </Text>
            <Text style={[styles.timeListText, { color: theme.text }]}>
              {item.time}
            </Text>
            <TouchableOpacity onPress={() => handleRemoveTime(index)}>
              <Ionicons name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(6),
    marginBottom: hp(1),
    padding: wp(5),
  },
  watercontainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingVertical: hp(3),
  },
  title: {
    fontSize: wp(12),
    marginRight: wp(9),
    fontFamily: 'Figtree',
    fontWeight: '400',
    textAlign: 'center',
  },
  mealDropdownContainer: {
    paddingHorizontal: 30,
    marginHorizontal: 30,
    marginTop: 40,
  },
  dropdownContainer: {
    paddingHorizontal: 15,
    borderRadius: 50,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  // Add a style for the opened dropdown if needed
  dropdownOpenedContainer: {
    // the container background of the list
    padding: 5,
    borderRadius: 8,
  },
  leftIcon: {
    marginRight: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  doneButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginTop: 20,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  addButtonContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  saveTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 25,
    width: '40%',
    justifyContent: 'center',
  },
  addIcon: {
    marginRight: 8,
  },
  saveTimeButtonText: {
    fontSize: 18,
    color: '#fff',
  },
  timeList: {
    width: '100%',
    marginTop: 70,
  },
  timeListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 35,
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 20,
  },
  timeListText: {
    fontSize: 16,
  },
});

export default FoodScreen;
