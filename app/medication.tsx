import React, { useState, useRef, useMemo } from "react";
import {View,Text,StyleSheet,SafeAreaView,TouchableOpacity,TextInput,Switch,} from "react-native";
import {Feather,AntDesign,MaterialCommunityIcons,Ionicons,} from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTheme } from "../ThemeProvider"; // ThemeProvider hook
import { useRouter } from "expo-router"; // Router for navigation
import { Dropdown } from "react-native-element-dropdown";
import { useFonts, Figtree_400Regular } from "@expo-google-fonts/figtree";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import DateTimePicker from '@react-native-community/datetimepicker';


const MedicationScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
   const [fontsLoaded] = useFonts({
      Figtree: Figtree_400Regular,
    });

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
 // List of medications
  const [medications, setMedications] = useState<
  { id: number; name: string; notes: string; isActive: boolean }[]
>([]);
  const [notes, setNotes] = useState("");
  const [selectedTime, setSelectedTime] = useState(""); // Holds selected time
  const [dropdownValue, setDropdownValue] = useState(""); // State for the dropdown
  const snapPoints = useMemo(() => [hp(65), hp(85)], []); // Snap points for medication sheet
  const timeSnapPoints = useMemo(() => [hp(85)], []); // Snap points for time sheet
  const scheduleSnapPoints = useMemo(() => ["85%"], []); // Snap points for schedule sheet
  const [isMedicationActive, setIsMedicationActive] = useState(false);
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

    // Toggle medication active state
    const toggleMedicationActive = (id: number) => {
      setMedications((prev) =>
        prev.map((medication) =>
          medication.id === id
            ? { ...medication, isActive: !medication.isActive }
            : medication
        )
      );
    };

    const handleDeleteMedication = (id: number) => {
      setMedications((prev) => prev.filter((medication) => medication.id !== id));
    };

    const handleSaveMedication = () => {
      if (medicationName.trim() === "") return;
  
      const newMedication = {
        id: Date.now(),
        name: medicationName,
        notes,
        isActive: isMedicationActive,
      };
  
      setMedications((prev) => [...prev, newMedication]);
      setMedicationName("");
      setNotes("");
      setIsMedicationActive(false);
      sheetRef.current?.close();
    };

  const formatDate = (date: Date | null): string => {
    if (!date) return "Not selected";
    return date.toLocaleDateString();
  };









   //FOR SCHEDULE 
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
            <Feather name="arrow-left" size={wp(7)}  color="#4a90e2" />
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
  











// FOR SET TIME
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
        <Feather name="arrow-left" size={wp(7)} color="#4a90e2" />
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
      <TouchableOpacity
          style={styles.saveTimeButton}
          onPress={handleAddTime}
        >
          <Text style={styles.saveTimeButtonText}>Add</Text>
        </TouchableOpacity>
        <View style={styles.pickercontainer}>
      {openPicker === 'start' && (
          <DateTimePicker
            value={startTime}
            mode="time"
            display="spinner"
            onChange={(event, date) => onChangeTime(event, date, setStartTime)}
            style={styles.dateTimePickerStyle} 
          />
        )}
      </View>

      <View style={styles.timeList}>
          {timeList.map((item, index) => (
            <View key={index} style={styles.timeListItem}>
              <MaterialCommunityIcons name="pill" size={wp(6)} color="red" />
              <Text style={styles.timeListText}>{item.label}</Text>
              <Text style={styles.timeListText}>{item.time}</Text>
              <TouchableOpacity onPress={() => handleRemoveTime(index)}>
                <Ionicons name="trash-outline" size={wp(5)} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      
    
  </BottomSheetScrollView>
);














 //FOR MEDICATION BOTTOM SHEET
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
            <Feather name="arrow-left" size={wp(7)}  color="#4a90e2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => {console.log("Medication saved"),sheetRef.current?.close(),handleSaveMedication();} // Close time sheet
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
        <Ionicons name="calendar-outline" size={wp(6)} color="#4a90e2" />
        <Text style={[styles.optionText, { color: theme.text }]}>Schedule</Text>
        <Ionicons name="chevron-forward" size={wp(6)} color="#aaa" />
      </TouchableOpacity>

      {/* Time */}
      <TouchableOpacity
        style={[styles.optionBox, { backgroundColor: theme.inputBackground }]}
        onPress={() => {
          timeSheetRef.current?.expand(); // Expand the time selection sheet
        }}
      >
        <Ionicons name="alarm-outline" size={wp(6)} color="orange" />
        <Text style={[styles.optionText, { color: theme.text }]}>
          {selectedTime || "Set Time"}
        </Text>
        <Ionicons name="chevron-forward" size={wp(6)} color="#aaa" />
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
            <Feather name="arrow-left" size={wp(7)}  color="#4a90e2" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => sheetRef.current?.expand()}>
            <AntDesign name="plus" size={wp(7.5)}  color="orange" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.medContainer}>
          <MaterialCommunityIcons name="pill" size={wp(13)} color="#ff5a5a" />
          <Text style={[styles.title, { color: theme.text }]}>Medication</Text>
        </View>


        <View style={styles.medicationList}>
          {medications.map((medication) => (
            <View key={medication.id} style={styles.medicationItem}>
              <Text style={styles.medicationName}>{medication.name}</Text>
              <Switch
                style={styles.switch}
                value={medication.isActive}
                onValueChange={() => toggleMedicationActive(medication.id)}
              />
              <TouchableOpacity
                onPress={() => handleDeleteMedication(medication.id)}
              >
                <Ionicons name="trash-outline" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))}
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
   flexDirection: 'row',
       justifyContent: 'space-between',
       alignItems: 'center',
       paddingHorizontal: wp(6),
       marginBottom: hp(1),
       padding: wp(5),
       
  },
  header1: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom:30
    
  },
  title: { fontSize: wp(11), marginRight:wp(4),marginLeft:wp(1),fontFamily: "Figtree",fontWeight: "400", textAlign: 'center' },
  medContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingVertical: hp(3),
    marginBottom: 10,
  },
  bottomSheetContent: {
    flex: 1, // Ensure it stretches to fill available space
    padding:wp(2.45),
    marginHorizontal:wp(2.5),
    borderTopLeftRadius: wp(10),
    borderTopRightRadius: wp(10),
    // Debugging border for alignment
    backgroundColor: "transparent", // Avoid conflicting with background
  },
  bottomSheetBackground: {
    borderTopLeftRadius: wp(9),
    borderTopRightRadius: wp(9),
    shadowColor: "#383838",
    marginHorizontal:wp(1.90),
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: wp(1),
    shadowRadius: wp(1),
    // elevation: 5,
    
   
  },
  handleIndicator: {
    backgroundColor: "#EA4335",
    width: wp(14),
    height: wp(1.1),
    borderRadius: wp(1),
    alignSelf: "center",
    marginVertical: wp(2.3),
  },
  input: {
    borderWidth: wp(.3),
    borderColor: "#B2B2B2",
    borderRadius: wp(13),
    padding: wp(4),
    fontSize: wp(4.7),
    margin:wp(7),
    fontFamily: "Figtree",
    backgroundColor: "#f9f9f9",
  },
  notesInput: {
    borderWidth: wp(.3),
    borderColor: "#B2B2B2",
    borderRadius: wp(3),
    padding: wp(3),
    fontSize: wp(4.7),
    height: hp(16),
    margin:wp(7),
    fontFamily: "Figtree",
    marginBottom: hp(2.5),
    textAlignVertical: "top",
    backgroundColor: "#f9f9f9",
  },
  optionBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: wp(.3),
    borderRadius: wp(13),
    padding: wp(5),
    borderColor:"#B2B2B2",
    margin:wp(7),
    marginBottom: 15,
    backgroundColor: "#fff",
   
  },
  optionText: {
    fontSize: wp(4.5),
    fontWeight: "500",
    flex: 0,
    fontFamily: "Figtree",
    color: "#333",
  },
  addButton: {
    
  },
  addButtonText: {
    fontSize: wp(5),
    fontFamily: "Figtree",
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
      paddingHorizontal: wp(3),
      marginHorizontal: wp(6),
      marginTop:hp(2),
      borderRadius: wp(15),
      paddingVertical:wp(1.1),
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth:wp(.3),
      borderColor:"#B2B2B2"
      
    },
    dropdownContainer: {
      paddingHorizontal: wp(6),
      marginHorizontal: wp(6),
      paddingVertical:hp(1.8) ,
      flexDirection: 'row',
      alignItems: 'center',
      
    },
    
    timeValue: { fontSize: wp(7), fontFamily:"Figtree",fontWeight: "400", color: "#000", marginRight: wp(5) },
    
   
    timeButtonText: {
      fontSize: wp(5),
      color: "#000",
    },
    saveTimeButton: {
      backgroundColor: "#0B82FF",
      padding: wp(3.5),
      alignSelf:"center",
      borderRadius: wp(10),
      alignItems: "center",
      width: "40%",
      marginTop: hp(6),
      
    },
    saveTimeButtonText: {
      fontSize: wp(5),
      color: "#fff",
      fontFamily: "Figtree_400Regular",
      fontWeight:"500"
    },
    timeList: {
      width: "100%",
      marginTop: hp(4),
      flex:hp(.5)
    },
    timeListItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: wp(.3),
      borderColor:"#B2B2B2",
      borderRadius: wp(9),
      padding: wp(4),
      marginVertical: 10,
      marginHorizontal: 20,
    },
    timeListText: {
      fontSize: wp(4),
      color: "#333",
      fontFamily:"Figtree",
    },
    timeBox: {
      paddingHorizontal: wp(1),
      marginHorizontal: wp(6),
      marginTop:hp(3.8),
      borderWidth: wp(.3),
      borderColor:"#B2B2B2",
      borderRadius: wp(15),
      paddingVertical:hp(1.25),
      flexDirection: 'row',
      justifyContent:"space-around",
      alignItems: 'center'
    },
    
    timeTextContainer: { flexDirection: 'row', alignItems: 'center'},
    // timeValue: { fontSize: 32, fontWeight: '400', color: '#000', marginRight: 20},
    timeSuffix: { fontSize: wp(5.5), fontWeight: '400', color: '##000000',fontFamily:"Figtree" },
    pickercontainer:{alignItems:"center",marginHorizontal:wp(8)},
    dateTimePickerStyle:{paddingHorizontal:wp(6),paddingVertical:hp(3)},











    scheduleContent: {
      paddingHorizontal: wp(5),
      marginVertical: hp(1),
      
    },
    dateBox: {
      padding: wp(3.2),
      borderRadius: wp(4),
      borderWidth: wp(.3),
      borderColor:"#B2B2B2",
      marginBottom: wp(5),
      
    },
    dateTitle: {
      fontSize: wp(4),
      fontWeight: "500",
      color: "#000",
      fontFamily:"Figtree_400Regular"
    },
    dateValue: {
      fontSize: wp(6),
      fontWeight: "600",
      color: "#4a90e2",
      marginTop: wp(1),
      fontFamily:"Figtree",
      alignSelf:"center"
    },
    pickerContainer: {
      alignItems: "center",
      marginVertical: hp(1),
      
      marginHorizontal:wp(5)
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
      fontSize: wp(2),
      color: "#fff",
    },

    medicationItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: wp(4),
      borderWidth: wp(.4),
      borderColor: "#ddd",
      borderRadius: wp(10),
      marginBottom: hp(2),
    },
    medicationName: {
      fontSize: wp(5),
      color: "#333",
      flex: 1,
      fontWeight: "500",
      fontFamily: "Figtree_400Regular",
      
    },
    switch:{
     paddingHorizontal:-wp(2),
     marginRight:wp(7),
     
    },
    medicationList: {
      paddingHorizontal: wp(6),
      marginTop:hp(4)
      
    },
});

export default MedicationScreen;

