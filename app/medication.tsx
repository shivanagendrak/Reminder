import React, { useState, useRef, useMemo } from "react";
import {View,Text,StyleSheet,SafeAreaView,TouchableOpacity,TextInput,} from "react-native";
import {Feather,AntDesign,MaterialCommunityIcons,Ionicons,} from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTheme } from "../ThemeProvider"; // ThemeProvider hook
import { useRouter } from "expo-router"; // Router for navigation
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker from '@react-native-community/datetimepicker';


const MedicationScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();


  const sheetRef = useRef<BottomSheet>(null); // Ref for Medication Details Sheet
  const timeSheetRef = useRef<BottomSheet>(null); // Ref for Time Selection Sheet
  const scheduleSheetRef = useRef<BottomSheet>(null); // Ref for Schedule Sheet


  const [openPicker, setOpenPicker] = useState<'start' | 'end' | 'every' | null>(null);
  const [startTime, setStartTime] = useState(new Date()); 
  const [timeList, setTimeList] = useState<{ label: string; time: string }[]>(
    []
  );



  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [openDatePicker, setOpenDatePicker] = useState<"start" | "end" | null>(null);



  const handleRemoveTime = (index: number) => {
    setTimeList((prevList) => prevList.filter((_, i) => i !== index));
  };


  const [medicationName, setMedicationName] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedTime, setSelectedTime] = useState(""); // Holds selected time
  const [dropdownValue, setDropdownValue] = useState(""); // State for the dropdown
  const snapPoints = useMemo(() => ["60%", "85%"], []); // Snap points for medication sheet
  const timeSnapPoints = useMemo(() => ["85%"], []); // Snap points for time sheet
  const scheduleSnapPoints = useMemo(() => ["85%"], []); // Snap points for schedule sheet
  const formatCustomTime = (time: Date) => {
    let hours = time.getHours();
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    hours = hours % 12 || 12;
    return { timeString: `${hours} : ${minutes}`, period };
  };
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
      // Close the bottom sheet
    }
  };
  const onChangeDate = (event: any, selectedDate: Date | undefined, type: "start" | "end") => {
    setOpenDatePicker(null); // Close picker
    if (selectedDate) {
      if (type === "start") setStartDate(selectedDate);
      if (type === "end") setEndDate(selectedDate);
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "Not selected";
    return date.toLocaleDateString();
  };










    // Renders the content for Schedule Bottom Sheet
    const renderScheduleContent = () => (
      <BottomSheetScrollView
        contentContainerStyle={[
          styles.bottomSheetContent,
          { backgroundColor: theme.background },
        ]}
      >
        <View style={styles.header1}>
          <TouchableOpacity onPress={() => scheduleSheetRef.current?.close()}>
            <Feather name="arrow-left" size={27} color="#4a90e2" />
          </TouchableOpacity>
        </View>
        <View style={styles.scheduleContent}>
          {/* Start Date */}
          <TouchableOpacity
            style={styles.dateBox}
            onPress={() => setOpenDatePicker("start")}
          >
            <Text style={styles.dateTitle}>Start Date</Text>
            <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
          </TouchableOpacity>
          {/* End Date */}
          <TouchableOpacity
            style={styles.dateBox}
            onPress={() => setOpenDatePicker("end")}
          >
            <Text style={styles.dateTitle}>End Date</Text>
            <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.pickerContainer}>
          {openDatePicker === "start" && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display="spinner"
              onChange={(event, date) => onChangeDate(event, date, "start")}
            />
          )}
          {openDatePicker === "end" && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display="spinner"
              onChange={(event, date) => onChangeDate(event, date, "end")}
            />
          )}
        </View>
        <TouchableOpacity
          style={styles.saveTimeButton}
          onPress={() => {
            console.log("Schedule Selected: ", { startDate, endDate });
            
          }}
        >
          <Text style={styles.saveTimeButtonText}>Save</Text>
        </TouchableOpacity>
      </BottomSheetScrollView>
    );
  












 // Renders the content for Time Selection
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
            { label: "Dinner", value: "Dinner" },
          ]}
          labelField="label"
          valueField="value"
          placeholder="Select Option"
          value={dropdownValue}
          onChange={(item) => setDropdownValue(item.value)}
        />
        </View>
        {/* Start Time */}
        <View style={styles.timeBox}>
          <TouchableOpacity
            onPress={() => setOpenPicker(openPicker === 'start' ? null : 'start')}
            style={styles.timeTextContainer}
          >
            <Text style={styles.timeValue}>{formatCustomTime(startTime).timeString}</Text>
            <Text style={styles.timeSuffix}>{formatCustomTime(startTime).period}</Text>
          </TouchableOpacity>
        </View>

      {/* <TouchableOpacity
        style={styles.saveTimeButton}
        onPress={() => {
          console.log("Time Added:", dropdownValue, selectedTime);
          timeSheetRef.current?.close(); // Close time sheet
        }}
      >
        <Text style={styles.saveTimeButtonText}>Add</Text>
      </TouchableOpacity> */}
  
      <TouchableOpacity
          style={styles.saveTimeButton}
          onPress={handleAddTime}
        >
          <Text style={styles.saveTimeButtonText}>Add</Text>
        </TouchableOpacity>

      <View style={styles.timeList}>
          {timeList.map((item, index) => (
            <View key={index} style={styles.timeListItem}>
              <MaterialCommunityIcons name="pill" size={24} color="red" />
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















  // Renders the content for Medication Details
  const renderContent = () => (
    <BottomSheetScrollView
      contentContainerStyle={[
        styles.bottomSheetContent,
        { backgroundColor: theme.background },
      ]}
    >
      <View style={styles.header1}>
          <TouchableOpacity onPress={() => {sheetRef.current?.close()}}>
            <Feather name="arrow-left" size={27} color="#4a90e2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => {console.log("Medication saved"),sheetRef.current?.close()} // Close time sheet
        }>
              <Text style={[styles.addButtonText, { color: theme.text }]}>Save</Text>
          </TouchableOpacity>
          
        </View>
      {/* Input Fields */}
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.inputBackground, color: theme.text },
        ]}
        placeholder="Enter Medication Name"
        placeholderTextColor="#aaa"
        value={medicationName}
        onChangeText={setMedicationName}
      />

      <TextInput
        style={[
          styles.notesInput,
          { backgroundColor: theme.inputBackground, color: theme.text },
        ]}
        placeholder="Notes..."
        placeholderTextColor="#aaa"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      {/* Schedule */}
      <TouchableOpacity
        style={[styles.optionBox, { backgroundColor: theme.inputBackground }]}
        onPress={() => {console.log("Schedule selected"),scheduleSheetRef.current?.expand(); }}
      >
        <Ionicons name="calendar-outline" size={24} color="#4a90e2" />
        <Text style={[styles.optionText, { color: theme.text }]}>Schedule</Text>
        <Ionicons name="chevron-forward" size={24} color="#aaa" />
      </TouchableOpacity>

      {/* Time */}
      <TouchableOpacity
        style={[styles.optionBox, { backgroundColor: theme.inputBackground }]}
        onPress={() => {
          timeSheetRef.current?.expand(); // Expand the time selection sheet
        }}
      >
        <Ionicons name="alarm-outline" size={24} color="orange" />
        <Text style={[styles.optionText, { color: theme.text }]}>
          {selectedTime || "Set Time"}
        </Text>
        <Ionicons name="chevron-forward" size={24} color="#aaa" />
      </TouchableOpacity>

      {/* Save Button */}
     
    </BottomSheetScrollView>
  );






















  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={27} color="#4a90e2" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => sheetRef.current?.expand()}>
            <AntDesign name="plus" size={35} color="orange" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.medContainer}>
          <MaterialCommunityIcons name="pill" size={40} color="#ff5a5a" />
          <Text style={[styles.title, { color: theme.text }]}>Medication</Text>
        </View>

        {/* Medication Details Bottom Sheet */}
        <BottomSheet
          ref={sheetRef}
          index={-1} // Initially closed
          snapPoints={snapPoints}
          enablePanDownToClose
          backgroundStyle={[styles.bottomSheetBackground, { backgroundColor: theme.background }]}
          handleIndicatorStyle={styles.handleIndicator}
        >
          {renderContent()}
        </BottomSheet>

        {/* Time Selection Bottom Sheet */}
        <BottomSheet
          ref={timeSheetRef}
          index={-1} // Initially closed
          snapPoints={timeSnapPoints}
          enablePanDownToClose
          backgroundStyle={[styles.bottomSheetBackground, { backgroundColor: theme.background }]}
          handleIndicatorStyle={styles.handleIndicator}
        >
          {renderTimeContent()}
        </BottomSheet>
        {/* Schedule Bottom Sheet */}
        <BottomSheet
          ref={scheduleSheetRef}
          index={-1}
          snapPoints={scheduleSnapPoints}
          enablePanDownToClose
          backgroundStyle={[styles.bottomSheetBackground, { backgroundColor: theme.background }]}
          handleIndicatorStyle={styles.handleIndicator}
        >
          {renderScheduleContent()}
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};





























const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginVertical: 10,
    paddingTop: 20,
  },
  header1: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom:30
    
  },
  title: {
    fontSize: 38,
    fontWeight: "400",
    textAlign: "center",
    marginTop: 10,
  },
  medContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingVertical: 15,
    marginBottom: 10,
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
  input: {
    borderWidth: 1,
    borderColor: "#B2B2B2",
    borderRadius: 40,
    padding: 20,
    fontSize: 16,
    margin:30,
    backgroundColor: "#f9f9f9",
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#B2B2B2",
    borderRadius: 20,
    padding: 14,
    fontSize: 16,
    height: 150,
    margin:30,
    marginBottom: 15,
    textAlignVertical: "top",
    backgroundColor: "#f9f9f9",
  },
  optionBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 35,
    padding: 20,
    borderColor:"#B2B2B2",
    margin:30,
    marginBottom: 15,
    backgroundColor: "#fff",
   
  },
  optionText: {
    fontSize: 18,
    fontWeight: "500",
    flex: 0,
    marginLeft: 0,
    color: "#333",
  },
  addButton: {
    
  },
  addButtonText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
  },

  timeTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  timeText: {
    fontSize: 22,
    fontWeight: "500",
    color: "#333",
  },


    timeContent: {
      marginBottom:20,
      borderWidth: 1,
      borderColor: "#ddd",
      backgroundColor: "#fff",
      marginHorizontal: 25,
      borderRadius: 50,
      flexDirection: 'row',
      
    },
    dropdownContainer: {
      paddingHorizontal: 30,
      marginHorizontal: 15,
      borderRadius: 50,
      paddingVertical:20 ,
      flexDirection: 'row',
      alignItems: 'center',
      
    },
    
    timeValue: { fontSize: 32, fontWeight: "400", color: "#000", marginRight: 20 },
    pickerStyles: {
      fontSize: 16,
      color: "#333",
      paddingVertical: 10,
    },
    timeSelector: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      width: "100%",
      marginBottom: 20,
      borderWidth:1,
    },
    timeButton: {
      padding: 15,
      borderRadius: 20,
      backgroundColor: "#f0f0f0",
      marginHorizontal: 10,
      alignItems: "center",
    },
    timeButtonText: {
      fontSize: 18,
      color: "#000",
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
      marginTop: 30,
    },
    timeListItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 25,
      padding: 15,
      marginVertical: 10,
      marginHorizontal: 20,
    },
    timeListText: {
      fontSize: 16,
      color: "#333",
    },
    timeBox: {
      paddingHorizontal: 20,
      marginHorizontal: 25,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 50,
      paddingVertical: 12,
      flexDirection: 'row',
      justifyContent:"space-around",
      alignItems: 'center'
    },
    
    timeTextContainer: { flexDirection: 'row', alignItems: 'center'},
    // timeValue: { fontSize: 32, fontWeight: '400', color: '#000', marginRight: 20},
    timeSuffix: { fontSize: 25, fontWeight: '400', color: '##000000' },
    pickercontainer:{alignItems:"center",flex:.9},











    scheduleContent: {
      paddingHorizontal: 20,
      marginVertical: 20,
    },
    dateBox: {
      padding: 15,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#ddd",
      marginBottom: 20,
    },
    dateTitle: {
      fontSize: 16,
      fontWeight: "500",
      color: "#333",
    },
    dateValue: {
      fontSize: 18,
      fontWeight: "600",
      color: "#4a90e2",
      marginTop: 5,
    },
    pickerContainer: {
      alignItems: "center",
      marginVertical: 10,
    },
    saveTimeButton1: {
      backgroundColor: "#0B82FF",
      padding: 15,
      alignSelf: "center",
      borderRadius: 25,
      alignItems: "center",
      width: "40%",
      marginTop: 30,
    },
    saveTimeButtonText1: {
      fontSize: 18,
      color: "#fff",
    },
});

export default MedicationScreen;

