import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons, SimpleLineIcons, Feather, EvilIcons } from '@expo/vector-icons';
import { useNavigation } from "expo-router";
import {useTheme} from "../ThemeProvider";

const WaterScreen: React.FC = () => {
  const navigation = useNavigation();

  const [openPicker, setOpenPicker] = useState<'start' | 'end' | 'every' | null>(null);

  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [everyTime, setEveryTime] = useState(new Date(0, 0, 0, 3, 50)); // Default 03:50

  const onChangeTime = (
    event: any,
    selectedDate: Date | undefined,
    setTime: (date: Date) => void,
  ) => {
    setOpenPicker(null); // Close picker after selection
    if (selectedDate) setTime(selectedDate);
  };

  const formatCustomTime = (time: Date) => {
    let hours = time.getHours();
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    hours = hours % 12 || 12;
    return { timeString: `${hours} : ${minutes}`, period };
  };

  const startNotifications = () => {
    console.log("Notifications started.");
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={27} color="#4a90e2" />
        </TouchableOpacity>
        <TouchableOpacity>
          <EvilIcons name="trash" size={35} color="red" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={styles.watercontainer}>
        <Ionicons name="water-outline" size={60} style={styles.waterIcon} />
        <Text style={styles.title}>Water</Text>
      </View>

      <View style={styles.container}>
        {/* Start Time */}
        <View style={styles.timeBox}>
          <View style={styles.iconWithLabel}>
            <SimpleLineIcons name="clock" size={25} color="#4a90e2" />
            <Text style={styles.label}>Start</Text>
          </View>
          <TouchableOpacity
            onPress={() => setOpenPicker(openPicker === 'start' ? null : 'start')}
            style={styles.timeTextContainer}
          >
            <Text style={styles.timeValue}>{formatCustomTime(startTime).timeString}</Text>
            <Text style={styles.timeSuffix}>{formatCustomTime(startTime).period}</Text>
          </TouchableOpacity>
        </View>
        

        {/* End Time */}
        <View style={styles.timeBox}>
          <View style={styles.iconWithLabel}>
            <SimpleLineIcons name="clock" size={25} color="#4a90e2" />
            <Text style={styles.label}>End</Text>
          </View>
          <TouchableOpacity
            onPress={() => setOpenPicker(openPicker === 'end' ? null : 'end')}
            style={styles.timeTextContainer}
          >
            <Text style={styles.timeValue}>{formatCustomTime(endTime).timeString}</Text>
            <Text style={styles.timeSuffix}>{formatCustomTime(endTime).period}</Text>
          </TouchableOpacity>
        </View>
        
       

        {/* Every */}
        <View style={styles.timeBox1}>
          <View style={styles.iconWithLabel}>
            <Ionicons name="alarm-outline" size={30} color="orange" />
            <Text style={styles.label}>Every</Text>
          </View>
          <TouchableOpacity
            onPress={() => setOpenPicker(openPicker === 'every' ? null : 'every')}
            style={styles.timeTextContainer}
          >
            <Text style={styles.timeValue1}>
              {everyTime.getHours().toString().padStart(2, '0')} : {everyTime.getMinutes().toString().padStart(2, '0')}
            </Text>
            <Text style={styles.timeSuffixSmall}>Hr</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.pickercontainer}>
        {openPicker === 'start' && (
          <DateTimePicker
            value={startTime}
            mode="time"
            display="spinner"
            onChange={(event, date) => onChangeTime(event, date, setStartTime)}
          />
        )}
        {openPicker === 'end' && (
          <DateTimePicker
            value={endTime}
            mode="time"
            display="spinner"
            onChange={(event, date) => onChangeTime(event, date, setEndTime)}
          />
        )}
        {openPicker === 'every' && (
          <DateTimePicker
            value={everyTime}
            mode="time"
            display="spinner"
            onChange={(event, date) => onChangeTime(event, date, setEveryTime)}
          />
        )}
        </View>


        {/* Add Button */}
        <TouchableOpacity style={styles.addButton} onPress={startNotifications}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
    padding: 20,
  },
  watercontainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingVertical: 20,
  },
  waterIcon: { color: "#4a90e2" },
  title: { fontSize: 50, fontWeight: "400", textAlign: 'center' },
  container: { flex: 5, padding: 20 },
  timeBox: {
    marginTop: 20,
    paddingHorizontal: 20,
    marginHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 50,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeBox1: {
    marginTop: 80,
    paddingHorizontal: 20,
    marginHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 50,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconWithLabel: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 18, color: '#333', marginLeft: 10, fontWeight: '500' },
  timeTextContainer: { flexDirection: 'row', alignItems: 'center' },
  timeValue: { fontSize: 32, fontWeight: '400', color: '#000', marginRight: 20 },
  timeValue1: { fontSize: 32, fontWeight: '400', color: '#000', marginRight: 20 },
  timeSuffix: { fontSize: 25, fontWeight: '400', color: '##000000',marginRight: 10 },
  timeSuffixSmall: { fontSize: 25, fontWeight: '400', color: '##000000',marginRight: 10},
  pickercontainer:{alignItems:"center",flex:.9},
  addButton: {
    top:0,
    padding: 15,
    backgroundColor: '#007AFF',
    marginHorizontal: 110,
    borderRadius: 28,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 25, fontWeight: "500" },
});

export default WaterScreen;
