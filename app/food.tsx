import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler"; // Import GestureHandlerRootView
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons, SimpleLineIcons, Feather, EvilIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from "expo-router";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "../ThemeProvider";
import { Dropdown } from "react-native-element-dropdown";
import { Picker } from '@react-native-picker/picker';
import { useFonts, Figtree_400Regular } from "@expo-google-fonts/figtree";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const foodScreen: React.FC = () => {
  const navigation = useNavigation();
  const timeSheetRef = useRef<BottomSheet>(null); 
  const [selectedTime, setSelectedTime] = useState(""); 
  const theme = useTheme();
  const timeSnapPoints = useMemo(() => ["85%"], []); 
  const [fontsLoaded] = useFonts({
        Figtree: Figtree_400Regular,
      });

  const [openPicker, setOpenPicker] = useState<'start' | 'end' | 'every' | null>(null);

  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [everyTime, setEveryTime] = useState(new Date(0, 0, 0, 3, 50)); // Default 03:50
  const [dropdownValue, setDropdownValue] = useState(""); 
  const [timeList, setTimeList] = useState<{ label: string; time: string }[]>(
      []
    );

  const onChangeTime = (
    event: any,
    selectedDate: Date | undefined,
    setTime: (date: Date) => void,
  ) => {
    setOpenPicker(null); // Close picker after selection
    if (selectedDate) setTime(selectedDate);
  };
  const handleAddTime = () => {
    if (dropdownValue && startTime) {
      const { timeString, period } = formatCustomTime(startTime);
      setTimeList((prevList) => [
        ...prevList,
        { label: dropdownValue, time: `${timeString} ${period}` }, // Save time as a string
      ]);
    }
  };

  const handleRemoveTime = (index: number) => {
    setTimeList((prevList) => prevList.filter((_, i) => i !== index));
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







  const renderTimeContent = () => (
    <BottomSheetScrollView
      contentContainerStyle={[
        styles.bottomSheetContent,
        { backgroundColor: theme.background },
      ]}
    >
      <View style={styles.header1}>
        <TouchableOpacity onPress={() => timeSheetRef.current?.close()}>
          <Feather name="arrow-left" size={27} color="#4a90e2" />
        </TouchableOpacity>
      </View>
  
        <View style={styles.timeContent}>
        <Dropdown
            style={styles.dropdownContainer}
            data={[
              { label: "Post Lunch", value: "Post Lunch" },
              { label: "Breakfast", value: "Breakfast" },
              { label: "Dinner", value: "Dinner" },
            ]}
            labelField="label"
            valueField="value"
            placeholder="Select Option"
            value={dropdownValue}
            onChange={(item) => setDropdownValue(item.value)}
          />
          </View>
          <View style={styles.timeBox}>
            <TouchableOpacity
              onPress={() => setOpenPicker(openPicker === 'start' ? null : 'start')}
              style={styles.timeTextContainer}
            >
              <Text style={styles.timeValue}>{formatCustomTime(startTime).timeString}</Text>
              <Text style={styles.timeSuffix}>{formatCustomTime(startTime).period}</Text>
            </TouchableOpacity>
          </View>
    
        <TouchableOpacity
            style={styles.saveTimeButton}
            onPress={handleAddTime}
          >
            <Text style={styles.saveTimeButtonText}>Add</Text>
          </TouchableOpacity>
  
        <View style={styles.timeList}>
            {timeList.map((item, index) => (
              <View key={index} style={styles.timeListItem}>
                <MaterialCommunityIcons name="hamburger"  size={24} color="#FF9613" />
                <Text style={styles.timeListText}>{item.label}</Text>
                <Text style={styles.timeListText}>{item.time}</Text>
                <TouchableOpacity onPress={() => handleRemoveTime(index)}>
                  <Ionicons name="trash-outline" size={24} color="red" />
                </TouchableOpacity>
              </View>
            ))}
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
        </View>
      
    </BottomSheetScrollView>
  );











  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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

        <View style={styles.watercontainer}>
          <MaterialCommunityIcons name="hamburger" size={wp(15)} color="#FF9613" />
          <Text style={styles.title}>Food</Text>
        </View>

        
          <View style={styles.timeBox1}>
            <View style={styles.iconWithLabel}>
              <Ionicons name="calendar-outline" size={wp(7)} />
            </View>
            <Dropdown
            style={styles.dropdownContainer}
            data={[
              { label: "Everyday", value: "Everyday" },
              { label: "Breakfast", value: "Breakfast" },
              { label: "Dinner", value: "Dinner" },
            ]}
            labelField="label"
            valueField="value"
            placeholder="Select Option"
            value={dropdownValue}
            onChange={(item) => setDropdownValue(item.value)}
          />
          </View>

          <TouchableOpacity
            style={[styles.optionBox, { backgroundColor: theme.inputBackground }]}
            onPress={() => {
              timeSheetRef.current?.expand();
            }}
          >
            <Ionicons name="alarm-outline" size={wp(7)} color="orange" />
            <Text style={[styles.optionText, { color: theme.text }]}>
              {selectedTime || "Time"}
            </Text>
            <Ionicons name="chevron-forward" size={24} color="#aaa" />
          </TouchableOpacity>

         

          <TouchableOpacity style={styles.addButton} onPress={startNotifications}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
          <BottomSheet
            ref={timeSheetRef}
            index={-1}
            snapPoints={timeSnapPoints}
            enablePanDownToClose
            backgroundStyle={[styles.bottomSheetBackground, { backgroundColor: theme.background }]}
            handleIndicatorStyle={styles.handleIndicator}
          >
            {renderTimeContent()}
          </BottomSheet>
        
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};


const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#fff' },
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
  
  title: { fontSize: wp(12), marginRight:wp(9),fontFamily: "Figtree",fontWeight: "400", textAlign: 'center' },
  container: { flex: 5, padding: 20 },
  timeBox: {
    marginTop: 20,
    paddingHorizontal: 100,
    marginHorizontal: 15,
    borderWidth: 1,
    borderColor:"#B2B2B2",
    borderRadius: 50,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf:"center",
    
  },
  timeBox1: {
    paddingHorizontal: 30,
    marginHorizontal: 30,
    marginTop:40,
    borderRadius: 50,
    paddingVertical:5,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth:1,
    borderColor:"#B2B2B2"
  },
  iconWithLabel: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 18, color: '#333', marginLeft: 10, fontWeight: '500' },
  timeTextContainer: { flexDirection: 'row', alignItems: 'center' },
  timeValue: { fontSize: 32, fontWeight: '400', color: '#000', marginRight: 20 },
  timeValue1: { fontSize: 32, fontWeight: '400', color: '#000', marginRight: 20 },
  timeSuffix: { fontSize: 25, fontWeight: '400', color: '##000000',marginRight: 10 },
  pickercontainer:{alignItems:"center",flex:.9},

  addButton: {
    padding: 15,
    backgroundColor: '#007AFF',
    marginHorizontal: 130,
    marginTop:50,
    borderRadius: 28,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 25, fontWeight: "500" },
  pickerContainer: {
    flexDirection: 'row',
    
    borderRadius: 10,
    marginHorizontal:40
    
  },
  picker: {
    flex: 1
   
  },
  bottomSheetContent: {
    flex: 1, // Ensure it stretches to fill available space
    padding:10,
    marginHorizontal:10,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
   
    // Debugging border for alignment
    
    backgroundColor: "transparent", // Avoid conflicting with background
  },
  header1: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom:30
    
  },
  timeContent: {
    marginBottom:20,
    borderWidth: 1,
    borderColor:"#B2B2B2",
    backgroundColor: "#fff",
    marginHorizontal: 25,
    borderRadius: 50,
    flexDirection: 'row',
    
  },
  dropdownContainer: {
    paddingHorizontal: 30,
    marginHorizontal: 35,
    borderRadius: 50,
    paddingVertical:20 ,
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  saveTimeButton: {
    backgroundColor: "#0B82FF",
    padding: 15,
    alignSelf:"center",
    borderRadius: 25,
    alignItems: "center",
    width: "40%",
    marginTop: 30,
    
  },
  saveTimeButtonText: {
    fontSize: 18,
    color: "#fff",
  },
  timeList: {
    width: "100%",
    marginTop: 70,
  },
  timeListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor:"#B2B2B2",
    borderRadius: 35,
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 20,
  },
  timeListText: {
    fontSize: 16,
    color: "#333",
  },
  optionBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 39,
    padding: 20,
    borderColor:"#B2B2B2",
    margin:30,
    marginTop:60,
    paddingVertical:22,
    marginBottom: 30,
    backgroundColor: "#fff",
   
  },
  optionText: {
    fontSize: 18,
    fontWeight: "500",
    flex: 0,
    marginLeft: 0,
    color: "#333",
  },
  bottomSheetBackground: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#383838",
    marginHorizontal:8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: .6,
    shadowRadius: 10,
    // elevation: 5,
   
  },
  handleIndicator: {
    backgroundColor: "#EA4335",
    width: 60,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginVertical: 10,
  },
});

export default foodScreen;
