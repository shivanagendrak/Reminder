import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView,Dimensions } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons, SimpleLineIcons, Feather, EvilIcons } from '@expo/vector-icons';
import { useNavigation } from "expo-router";
import {useTheme} from "../ThemeProvider";
import { Picker } from '@react-native-picker/picker';
import { useFonts, Figtree_400Regular } from "@expo-google-fonts/figtree";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


const WaterScreen: React.FC = () => {
  const navigation = useNavigation();
   const [fontsLoaded] = useFonts({
      Figtree: Figtree_400Regular,
    });

  const [openPicker, setOpenPicker] = useState<'start' | 'end' | 'every' | null>(null);

  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [everyTime, setEveryTime] = useState(new Date(0, 0, 0, 3, 50)); // Default 03:50
  const { width, height } = Dimensions.get("window"); // Get screen dimensions
  

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
          <Feather name="arrow-left" size={wp(7)} color="#4a90e2" />
        </TouchableOpacity>
        <TouchableOpacity>
          <EvilIcons name="trash" size={wp(8)} color="red" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={styles.watercontainer}>
        <Ionicons name="water-outline" size={wp(15)} style={styles.waterIcon} />
        <Text style={styles.title}>Water</Text>
      </View>

      <View style={styles.container}>
        {/* Start Time */}
        <View style={styles.timeBox}>
          <View style={styles.iconWithLabel}>
            <SimpleLineIcons name="clock" size={wp(7)} color="#4a90e2" />
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
    <Text style={styles.timeSuffix}>Hr</Text>
  </TouchableOpacity>
  
</View>

        <View style={styles.pickercontainer}>
        {openPicker === 'start' && (
          <View style={styles.pickerContainer}>
          <DateTimePicker
            value={startTime}
            mode="time"
            display="spinner"
            onChange={(event, date) => onChangeTime(event, date, setStartTime)}
          />
          </View>
        )}

        {openPicker === 'end' && (
          <View style={styles.pickerContainer}>
          <DateTimePicker
            value={endTime}
            mode="time"
            display="spinner"
            onChange={(event, date) => onChangeTime(event, date, setEndTime)}
          />
          </View>
        )}


       {openPicker === 'every' && (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={everyTime.getHours()}
        onValueChange={(value) => setEveryTime(new Date(0, 0, 0, value, everyTime.getMinutes())) }
        
        style={styles.picker}

      >
        {Array.from({ length: 24 }, (_, i) => (
          <Picker.Item key={i} label={`${i} Hr`} value={i} />
        ))}
      </Picker>
      <Picker
        selectedValue={everyTime.getMinutes()}
        onValueChange={(value) => {setEveryTime(new Date(0, 0, 0, everyTime.getHours(), value));setOpenPicker(null);}}
        style={styles.picker}
      >
        {Array.from({ length: 60 }, (_, i) => (
          <Picker.Item key={i} label={`${i} Min`} value={i} />
        ))}
      </Picker>
    </View>
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
  safeContainer: { flex: wp(1), backgroundColor: '#fff' },
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
  waterIcon: { color: "#4a90e2", marginRight:wp(2) },
  title: { fontSize: wp(13), marginRight:wp(14),fontFamily: "Figtree",fontWeight: "400", textAlign: 'center' },
  container: { flex: 5, padding: wp(5)},
  timeBox: {
    marginTop: hp(1.5),
    paddingHorizontal: wp(5),
    marginHorizontal: wp(4),
    borderWidth: wp(.4),
    borderColor: '#ddd',
    borderRadius: wp(10),
    paddingVertical: hp(1.3),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    
  },
  timeBox1: {
    marginTop: hp(5),
    paddingHorizontal: wp(5),
    marginHorizontal: wp(4),
    borderWidth: wp(.4),
    borderColor: '#ddd',
    borderRadius: wp(10),
    paddingVertical: hp(1.2),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconWithLabel: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: wp(4.5), color: '#333', marginLeft: wp(2.5), fontWeight: '500'},
  timeTextContainer: { flexDirection: 'row', alignItems: 'center'},
  timeValue: { fontSize: wp(7), fontWeight: '400', color: '#000', marginRight: wp(5) },
  timeValue1: { fontSize: wp(7), fontWeight: '400', color: '#000', marginRight: wp(5) },
  timeSuffix: { fontSize: wp(5), fontWeight: '400', color: '##000000',marginRight: wp(3) },
  pickercontainer:{alignItems:"center",alignSelf:"center",height:hp(28),width:wp(80),marginTop:hp(1)},
  addButton: {
    padding: hp(1.3),
    backgroundColor: '#007AFF',
    marginHorizontal: wp(28),
    borderRadius: wp(10),
    marginTop:hp(.5),
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontSize: wp(6), fontWeight: "500" },
  pickerContainer: {
    flexDirection: 'row',
    alignSelf:"center",
    height:hp(25),
    width:wp(70),
    marginHorizontal:wp(50),
    marginRight:wp(50),
    marginTop:hp(2)
    
  },
  picker: {
    flex: hp(.1),
   marginHorizontal:wp(1),
  },
  
 
  
});

export default WaterScreen;
