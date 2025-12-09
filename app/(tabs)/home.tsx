import { SafeAreaView } from "react-native-safe-area-context";
import { Modal, Text, TouchableOpacity, View, TextInput, ScrollView, Image, Animated, Alert } from "react-native";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import InputField from "@/components/InputField";
import { icons } from "@/constants";
import { StatusBar } from "expo-status-bar";
import { useState, useRef, useEffect } from "react";
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { Video, ResizeMode } from 'expo-av';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import ReanimatedAnimated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface MediaAsset {
    uri: string;
    type: 'image' | 'video';
}

interface Task {
    id: string;
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    mediaAsset: MediaAsset | null;
    audioUri: string | null;
    audioDuration: number;
    dateCreated: Date;
}

export default function Home() {
    const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
    const [selectedPriority, setSelectedPriority] = useState<'High' | 'Medium' | 'Low' | null>(null);
    const [isPriorityOpen, setIsPriorityOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [mediaAsset, setMediaAsset] = useState<MediaAsset | null>(null);
    const [showMediaFullScreen, setShowMediaFullScreen] = useState(false);
    const [audioRecording, setAudioRecording] = useState<Audio.Recording | null>(null);
    const [audioUri, setAudioUri] = useState<string | null>(null);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [audioSound, setAudioSound] = useState<Audio.Sound | null>(null);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);

    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showTaskDetail, setShowTaskDetail] = useState(false);

    const waveAnim1 = useRef(new Animated.Value(0.3)).current;
    const waveAnim2 = useRef(new Animated.Value(0.5)).current;
    const waveAnim3 = useRef(new Animated.Value(0.7)).current;
    const waveAnim4 = useRef(new Animated.Value(0.5)).current;
    const waveAnim5 = useRef(new Animated.Value(0.3)).current;
    const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isRecording) {
            const animations = [waveAnim1, waveAnim2, waveAnim3, waveAnim4, waveAnim5];
            const loops = animations.map((anim, index) =>
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(anim, {
                            toValue: 1,
                            duration: 300 + index * 50,
                            useNativeDriver: true,
                        }),
                        Animated.timing(anim, {
                            toValue: 0.3,
                            duration: 300 + index * 50,
                            useNativeDriver: true,
                        }),
                    ])
                )
            );
            loops.forEach(loop => loop.start());
            return () => loops.forEach(loop => loop.stop());
        }
    }, [isRecording]);

    useEffect(() => {
        return () => {
            if (audioSound) {
                audioSound.unloadAsync();
            }
            if (audioRecording) {
                audioRecording.stopAndUnloadAsync();
            }
        };
    }, []);

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant permission to access your photo library.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            setMediaAsset({
                uri: asset.uri,
                type: asset.type === 'video' ? 'video' : 'image',
            });
        }
    };

    const handleRemoveMedia = () => {
        setMediaAsset(null);
        setShowMediaFullScreen(false);
    };

    const startRecording = async () => {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant permission to access your microphone.');
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setAudioRecording(recording);
            setIsRecording(true);
            setRecordingDuration(0);

    
            let duration = 0;
            recordingTimerRef.current = setInterval(() => {
                duration += 1;
                setRecordingDuration(duration);

                if (duration >= 15) {
                    stopRecording();
                }
            }, 1000);

        } catch (err) {
            console.error('Failed to start recording', err);
            Alert.alert('Error', 'Failed to start recording');
        }
    };

    const stopRecording = async () => {
        if (!audioRecording) return;

        try {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
                recordingTimerRef.current = null;
            }

            setIsRecording(false);
            await audioRecording.stopAndUnloadAsync();
            const uri = audioRecording.getURI();
            setAudioRecording(null);

            if (uri) {
                setAudioUri(uri);
            }
        } catch (err) {
            console.error('Failed to stop recording', err);
        }
    };

    const handleRecordingToggle = async () => {
        if (isRecording) {
            await stopRecording();
        } else {
            await startRecording();
        }
    };

    const handlePlayAudio = async () => {
        if (!audioUri) return;

        try {
            if (isPlayingAudio && audioSound) {
                await audioSound.pauseAsync();
                setIsPlayingAudio(false);
            } else if (audioSound) {
            
                const status = await audioSound.getStatusAsync();
                if (status.isLoaded && status.didJustFinish) {
                    await audioSound.setPositionAsync(0);
                }
                await audioSound.playAsync();
                setIsPlayingAudio(true);
            } else {
                const { sound } = await Audio.Sound.createAsync(
                    { uri: audioUri },
                    { shouldPlay: true }
                );
                setAudioSound(sound);
                setIsPlayingAudio(true);

                sound.setOnPlaybackStatusUpdate((status) => {
                    if (status.isLoaded && status.didJustFinish) {
                        setIsPlayingAudio(false);
                    }
                });
            }
        } catch (err) {
            console.error('Failed to play audio', err);
        }
    };

    const handleRemoveAudio = async () => {
        if (audioSound) {
            await audioSound.unloadAsync();
            setAudioSound(null);
        }
        setAudioUri(null);
        setIsPlayingAudio(false);
        setRecordingDuration(0);
    };

    const handleCreateTask = () => {
        if (!selectedPriority) {
            Alert.alert('Missing Information', 'Please select a priority level.');
            return;
        }

        const newTask: Task = {
            id: Date.now().toString(),
            title: title.trim() || 'Untitled Task',
            description: description.trim(),
            priority: selectedPriority,
            mediaAsset: mediaAsset,
            audioUri: audioUri,
            audioDuration: recordingDuration,
            dateCreated: new Date(),
        };

        setTasks([newTask, ...tasks]);

     
        setTitle('');
        setDescription('');
        setSelectedPriority(null);
        setMediaAsset(null);
        setAudioUri(null);
        setRecordingDuration(0);
        if (audioSound) {
            audioSound.unloadAsync();
            setAudioSound(null);
        }
        setIsPlayingAudio(false);
        setShowCreateTaskModal(false);
    };

    const handleTaskPress = (task: Task) => {
        setSelectedTask(task);
        setShowTaskDetail(true);
    };

    const handleDeleteTask = (taskId: string) => {
        Alert.alert(
            'Delete Session',
            'Deleting a session is not recoverable',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setTasks(tasks.filter(task => task.id !== taskId));
                    }
                }
            ]
        );
    };

    const formatDate = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const truncateText = (text: string, maxLength: number = 60) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    };

    const getPriorityColor = (priority: 'High' | 'Medium' | 'Low') => {
        switch (priority) {
            case 'High': return 'bg-red-500';
            case 'Medium': return 'bg-yellow-500';
            case 'Low': return 'bg-green-500';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar hidden />

            <View className="flex-row items-center justify-between px-4 mb-4">
                <View className="w-10 h-10 bg-blue-300 rounded-full items-center justify-center">
                    <Text className="text-sm font-semibold">KA</Text>
                </View>

                <Text className="font-bold text-2xl">Home</Text>

                <TouchableOpacity
                    onPress={() => setShowCreateTaskModal(true)}
                    className="h-12 w-12 rounded-full bg-blue-500 items-center justify-center"
                >
                    <Ionicons name="time-outline" size={28} color="white" />
                </TouchableOpacity>
            </View>

            <View className="px-4 mb-4">
                <InputField
                    label=""
                    placeholder="Search dives..."
                    icon={icons.search}
                    textContentType="none"
                    autoCorrect={false}
                    autoCapitalize="none"
                    className="px-4 mb-4"
                />
            </View>

            <ScrollView className="flex-1 px-4">
                {tasks.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <FontAwesome5 name="tasks" size={48} color="#5D76A9" />
                        <Text className="text-[#007791] mt-4 text-base">No sessions yet</Text>
                        <Text className="text-[#003153] text-xl mt-3 tracking-wide text-center">Create your first session to get started by pressing the timer icon</Text>
                    </View>
                ) : (
                    tasks.map((task) => (
                        <SwipeableTaskItem
                            key={task.id}
                            task={task}
                            onPress={() => handleTaskPress(task)}
                            onDelete={() => handleDeleteTask(task.id)}
                            getPriorityColor={getPriorityColor}
                            truncateText={truncateText}
                            formatDate={formatDate}
                        />
                    ))
                )}
            </ScrollView>

            <Modal
                visible={showCreateTaskModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowCreateTaskModal(false)}
            >
                <SafeAreaView className="flex-1 bg-white">
                    <ScrollView className="flex-1 px-6 pt-6">
                        <View className="flex-row items-center justify-between mb-6">
                            <View className="flex-1">
                                <Text className="text-2xl font-bold text-black mb-1">Session Creation</Text>
                                <Text className="text-md text-blue-800 mt-2">Create a new focus session and set its priority level </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowCreateTaskModal(false)}
                                className="p-2"
                            >
                                <Ionicons name="close" size={28} color="black" />
                            </TouchableOpacity>
                        </View>

                        <View className="mb-6">
                            <Text className="text-sm font-semibold text-black mb-2">Session Title</Text>
                            <TextInput
                                placeholder="Enter task title..."
                                placeholderTextColor="#9CA3AF"
                                value={title}
                                onChangeText={setTitle}
                                className="border border-gray-300 rounded-lg px-4 py-3 text-base text-black"
                            />
                        </View>

                        <View className="mb-6">
                            <Text className="text-sm font-semibold text-black mb-2">Priority Level</Text>

                            <TouchableOpacity
                                onPress={() => setIsPriorityOpen(!isPriorityOpen)}
                                className="border border-gray-300 rounded-lg px-4 py-3 flex-row items-center justify-between"
                            >
                                <View className="flex-row items-center">
                                    {selectedPriority ? (
                                        <>
                                            <View className={`w-3 h-3 rounded-full mr-2 ${
                                                selectedPriority === 'High' ? 'bg-red-500' :
                                                selectedPriority === 'Medium' ? 'bg-yellow-500' :
                                                'bg-green-500'
                                            }`} />
                                            <Text className="text-base text-black">{selectedPriority} Priority</Text>
                                        </>
                                    ) : (
                                        <Text className="text-base text-gray-400">Select priority level</Text>
                                    )}
                                </View>
                                <MaterialIcons
                                    name={isPriorityOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                                    size={24}
                                    color="black"
                                />
                            </TouchableOpacity>

                            {isPriorityOpen && (
                                <View className="mt-2 border border-gray-300 rounded-lg overflow-hidden">
                                    {(['High', 'Medium', 'Low'] as const).map((priority, index) => (
                                        <TouchableOpacity
                                            key={priority}
                                            onPress={() => {
                                                setSelectedPriority(priority);
                                                setIsPriorityOpen(false);
                                            }}
                                            className={`px-4 py-3 flex-row items-center ${
                                                index !== 2 ? 'border-b border-gray-200' : ''
                                            } ${selectedPriority === priority ? 'bg-gray-50' : 'bg-white'}`}
                                        >
                                            <View className={`w-3 h-3 rounded-full mr-3 ${
                                                priority === 'High' ? 'bg-red-500' :
                                                priority === 'Medium' ? 'bg-yellow-500' :
                                                'bg-green-500'
                                            }`} />
                                            <Text className="text-base text-black flex-1">{priority} Priority</Text>
                                            {selectedPriority === priority && (
                                                <MaterialIcons name="check" size={20} color="black" />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        <View className="mb-6">
                            <Text className="text-sm font-semibold text-black mb-2">Description</Text>
                            <View className="border border-gray-300 rounded-lg">
                                <TextInput
                                    placeholder="Add task description..."
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    value={description}
                                    onChangeText={setDescription}
                                    className="px-4 py-3 text-base text-black min-h-[100px]"
                                />

                                <View className="flex-row border-t border-gray-200 px-4 py-3">
                                    <TouchableOpacity
                                        className="flex-row items-center mr-6"
                                        onPress={handlePickImage}
                                        disabled={mediaAsset !== null}
                                    >
                                        <Ionicons
                                            name="image-outline"
                                            size={22}
                                            color={mediaAsset ? "#9CA3AF" : "black"}
                                        />
                                        <Text className={`text-sm ml-2 ${mediaAsset ? 'text-gray-400' : 'text-black'}`}>
                                            Add Image
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={handleRecordingToggle}
                                        className="flex-row items-center"
                                        disabled={audioUri !== null}
                                    >
                                        <Ionicons
                                            name={isRecording ? "stop-circle" : "mic-outline"}
                                            size={22}
                                            color={isRecording ? "#EF4444" : audioUri ? "#9CA3AF" : "black"}
                                        />
                                        <Text className={`text-sm ml-2 ${isRecording ? 'text-red-500' : audioUri ? 'text-gray-400' : 'text-black'}`}>
                                            {isRecording ? `Recording ${recordingDuration}s...` : 'Record Audio'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {isRecording && (
                                <View className="mt-4 bg-gray-50 rounded-lg p-4">
                                    <View className="flex-row items-center justify-center space-x-1">
                                        {[waveAnim1, waveAnim2, waveAnim3, waveAnim4, waveAnim5].map((anim, index) => (
                                            <Animated.View
                                                key={index}
                                                style={{
                                                    width: 4,
                                                    height: 40,
                                                    backgroundColor: '#EF4444',
                                                    borderRadius: 2,
                                                    marginHorizontal: 2,
                                                    transform: [{
                                                        scaleY: anim
                                                    }]
                                                }}
                                            />
                                        ))}
                                    </View>
                                    <Text className="text-center text-sm text-gray-600 mt-2">
                                        Recording ... {recordingDuration}s / 15s
                                    </Text>
                                </View>
                            )}

                            
                            {(mediaAsset || audioUri) && (
                                <View className="flex-row px-4 py-3 gap-4">

                                    {mediaAsset && (
                                        <TouchableOpacity
                                            onPress={() => setShowMediaFullScreen(true)}
                                            className="relative rounded-lg overflow-hidden w-32 h-32"
                                        >
                                            {mediaAsset.type === 'image' ? (
                                                <Image
                                                    source={{ uri: mediaAsset.uri }}
                                                    className="w-full h-full rounded-lg"
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View className="w-full h-full bg-black rounded-lg items-center justify-center">
                                                    <Video
                                                        source={{ uri: mediaAsset.uri }}
                                                        style={{ width: '100%', height: '100%' }}
                                                        resizeMode={ResizeMode.CONTAIN}
                                                        shouldPlay={false}
                                                        useNativeControls={false}
                                                    />
                                                    <View className="absolute">
                                                        <Ionicons name="play-circle" size={32} color="white" />
                                                    </View>
                                                </View>
                                            )}
                                            <TouchableOpacity
                                                onPress={handleRemoveMedia}
                                                className="absolute top-1 right-1 bg-black/70 rounded-full p-1"
                                            >
                                                <Ionicons name="close" size={16} color="white" />
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                    )}

                                  
                                    {audioUri && !isRecording && (
                                        <View className="relative rounded-lg overflow-hidden w-32 h-32 bg-gray-200 items-center justify-center">
                                            <View className="items-center justify-center">
                                                <TouchableOpacity
                                                    onPress={handlePlayAudio}
                                                    className="bg-blue-700 rounded-full p-4 mb-2"
                                                >
                                                    <Ionicons
                                                        name={isPlayingAudio ? "pause" : "play"}
                                                        size={28}
                                                        color="#F0EFEA"
                                                    />
                                                </TouchableOpacity>
                                                <Text className="text-xs text-gray-600">
                                                    {recordingDuration}s
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                onPress={handleRemoveAudio}
                                                className="absolute top-1 right-1 bg-black/70 rounded-full p-1"
                                            >
                                                <Ionicons name="close" size={16} color="white" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>

                        <TouchableOpacity
                            className="bg-blue- rounded-lg py-4 mb-6"
                            onPress={handleCreateTask}
                        >
                            <Text className="text-white text-center text-base font-semibold">Create Task</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            <Modal
                visible={showMediaFullScreen}
                animationType="fade"
                presentationStyle="fullScreen"
                onRequestClose={() => setShowMediaFullScreen(false)}
            >
                <SafeAreaView className="flex-1 bg-black">
                    <View className="flex-1">
                        <View className="flex-row items-center justify-between px-4 py-4">
                            <TouchableOpacity
                                onPress={() => setShowMediaFullScreen(false)}
                                className="bg-gray-800 rounded-full p-2"
                            >
                                <Ionicons name="close" size={28} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleRemoveMedia}
                                className="bg-red-500 rounded-full p-2"
                            >
                                <Ionicons name="trash" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-1 items-center justify-center">
                            {mediaAsset?.type === 'image' ? (
                                <Image
                                    source={{ uri: mediaAsset.uri }}
                                    className="w-full h-full"
                                    resizeMode="contain"
                                />
                            ) : mediaAsset?.type === 'video' ? (
                                <Video
                                    source={{ uri: mediaAsset.uri }}
                                    style={{ width: '100%', height: '100%' }}
                                    resizeMode={ResizeMode.CONTAIN}
                                    shouldPlay={true}
                                    useNativeControls={true}
                                    isLooping
                                />
                            ) : null}
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>

            {selectedTask && (
                <Modal
                    visible={showTaskDetail}
                    animationType="slide"
                    presentationStyle="pageSheet"
                    onRequestClose={() => setShowTaskDetail(false)}
                >
                    <SafeAreaView className="flex-1 bg-white">
                        <View className="flex-1">
                            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
                                <Text className="text-xl font-bold text-black">Task Details</Text>
                                <TouchableOpacity
                                    onPress={() => setShowTaskDetail(false)}
                                    className="p-2"
                                >
                                    <Ionicons name="close" size={28} color="black" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView className="flex-1">
                                <View className="px-6 py-4">
                                    <View className="flex-row items-center justify-between mb-4">
                                        <Text className="text-2xl font-bold text-black flex-1">
                                            {selectedTask.title}
                                        </Text>
                                        <View className="flex-row items-center ml-2">
                                            <View className={`w-3 h-3 rounded-full ${getPriorityColor(selectedTask.priority)}`} />
                                            <Text className="text-sm text-gray-600 ml-2">{selectedTask.priority}</Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-center mb-6">
                                        <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
                                        <Text className="text-sm text-gray-500 ml-2">
                                            Created {formatDate(selectedTask.dateCreated)}
                                        </Text>
                                    </View>

                                    {selectedTask.mediaAsset && (
                                        <View className="mb-6">
                                            <Text className="text-sm font-semibold text-black mb-3">Media</Text>
                                            <View className="rounded-xl overflow-hidden bg-gray-100">
                                                {selectedTask.mediaAsset.type === 'image' ? (
                                                    <Image
                                                        source={{ uri: selectedTask.mediaAsset.uri }}
                                                        className="w-full h-64"
                                                        resizeMode="cover"
                                                    />
                                                ) : (
                                                    <Video
                                                        source={{ uri: selectedTask.mediaAsset.uri }}
                                                        style={{ width: '100%', height: 256 }}
                                                        resizeMode={ResizeMode.CONTAIN}
                                                        useNativeControls={true}
                                                        shouldPlay={false}
                                                    />
                                                )}
                                            </View>
                                        </View>
                                    )}

                                    {selectedTask.audioUri && (
                                        <View className="mb-6">
                                            <Text className="text-sm font-semibold text-black mb-3">Audio Recording</Text>
                                            <TaskAudioPlayer
                                                audioUri={selectedTask.audioUri}
                                                audioDuration={selectedTask.audioDuration}
                                            />
                                        </View>
                                    )}

                                    {selectedTask.description && (
                                        <View className="mb-6">
                                            <Text className="text-sm font-semibold text-black mb-3">Description</Text>
                                            <View className="bg-gray-50 rounded-lg p-4">
                                                <Text className="text-base text-gray-700 leading-6">
                                                    {selectedTask.description}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </ScrollView>
                        </View>
                    </SafeAreaView>
                </Modal>
            )}
        </SafeAreaView>
    );
}

const SwipeableTaskItem = ({
    task,
    onPress,
    onDelete,
    getPriorityColor,
    truncateText,
    formatDate
}: {
    task: Task;
    onPress: () => void;
    onDelete: () => void;
    getPriorityColor: (priority: 'High' | 'Medium' | 'Low') => string;
    truncateText: (text: string, maxLength?: number) => string;
    formatDate: (date: Date) => string;
}) => {
    const translateX = useSharedValue(0);
    const itemHeight = useSharedValue(1);
    const opacity = useSharedValue(1);
    const backgroundColor = useSharedValue(0);

    const gesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onUpdate((event) => {
           
            if (event.translationX < 0) {
                translateX.value = event.translationX;
                backgroundColor.value = Math.min(Math.abs(event.translationX) / 200, 1);
            }
        })
        .onEnd(() => {
            if (translateX.value < -200) {
                
                translateX.value = withSpring(-400, {}, () => {
                    'worklet';
                    onDelete();
                });
                opacity.value = withSpring(0);
            } else if (translateX.value < -80) {
                
                translateX.value = withSpring(-80);
                backgroundColor.value = withSpring(0);
            } else {
               
                translateX.value = withSpring(0);
                backgroundColor.value = withSpring(0);
            }
        });

    const animatedStyle = useAnimatedStyle(() => {
        const bgColor = backgroundColor.value > 0.5
            ? `rgba(239, 68, 68, ${backgroundColor.value})`
            : 'rgba(255, 255, 255, 1)';

        return {
            transform: [{ translateX: translateX.value }],
            backgroundColor: bgColor,
        };
    });

    const containerStyle = useAnimatedStyle(() => ({
        height: itemHeight.value === 1 ? undefined : itemHeight.value,
        opacity: opacity.value,
    }));

    const deleteIconStyle = useAnimatedStyle(() => ({
        opacity: translateX.value < -80 ? 1 : 0,
    }));

    return (
        <ReanimatedAnimated.View style={containerStyle} className="mb-3">
            <View className="relative">
                <ReanimatedAnimated.View
                    style={deleteIconStyle}
                    className="absolute right-4 top-0 bottom-0 items-center justify-center z-10"
                >
                    <Ionicons name="trash" size={24} color="#EF4444" />
                </ReanimatedAnimated.View>

                <GestureDetector gesture={gesture}>
                    <ReanimatedAnimated.View style={animatedStyle} className="rounded-xl overflow-hidden shadow-sm">
                        <TouchableOpacity
                            onPress={onPress}
                            activeOpacity={0.7}
                        >
                            <View className="flex-row">
                                {task.mediaAsset && (
                                    <View className="w-24 h-24">
                                        {task.mediaAsset.type === 'image' ? (
                                            <Image
                                                source={{ uri: task.mediaAsset.uri }}
                                                className="w-full h-full"
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View className="w-full h-full bg-black items-center justify-center">
                                                <Ionicons name="play-circle" size={32} color="white" />
                                            </View>
                                        )}
                                    </View>
                                )}

                                <View className="flex-1 p-3">
                                    <View className="flex-row items-start justify-between mb-1">
                                        <Text className="text-base font-semibold text-black flex-1" numberOfLines={1}>
                                            {task.title}
                                        </Text>
                                        <View className={`w-2 h-2 rounded-full ml-2 ${getPriorityColor(task.priority)}`} />
                                    </View>

                                    {task.description && (
                                        <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
                                            {truncateText(task.description)}
                                        </Text>
                                    )}

                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-xs text-gray-400">
                                            {formatDate(task.dateCreated)}
                                        </Text>

                                        {task.audioUri && (
                                            <View className="flex-row items-center">
                                                <Ionicons name="mic" size={14} color="#6B7280" />
                                                <Text className="text-xs text-gray-500 ml-1">
                                                    {task.audioDuration}s
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </ReanimatedAnimated.View>
                </GestureDetector>
            </View>
        </ReanimatedAnimated.View>
    );
};

const TaskAudioPlayer = ({ audioUri, audioDuration }: { audioUri: string; audioDuration: number }) => {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(audioDuration * 1000);

    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const handlePlayPause = async () => {
        try {
            if (isPlaying && sound) {
                await sound.pauseAsync();
                setIsPlaying(false);
            } else if (sound) {
                const status = await sound.getStatusAsync();
                if (status.isLoaded && status.didJustFinish) {
                    await sound.setPositionAsync(0);
                }
                await sound.playAsync();
                setIsPlaying(true);
            } else {
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: audioUri },
                    { shouldPlay: true },
                    (status) => {
                        if (status.isLoaded) {
                            setPosition(status.positionMillis);
                            setDuration(status.durationMillis || audioDuration * 1000);
                            if (status.didJustFinish) {
                                setIsPlaying(false);
                                setPosition(0);
                            }
                        }
                    }
                );
                setSound(newSound);
                setIsPlaying(true);
            }
        } catch (err) {
            console.error('Failed to play audio', err);
        }
    };

    const formatTime = (millis: number) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? position / duration : 0;

    return (
        <View className="bg-blue-50 rounded-xl p-4">
            <View className="flex-row items-center">
                <TouchableOpacity
                    onPress={handlePlayPause}
                    className="bg-blue-600 rounded-full w-14 h-14 items-center justify-center"
                >
                    <Ionicons
                        name={isPlaying ? "pause" : "play"}
                        size={28}
                        color="white"
                    />
                </TouchableOpacity>

                <View className="flex-1 ml-4">
                    <View className="h-1 bg-blue-200 rounded-full overflow-hidden">
                        <View
                            className="h-full bg-blue-600"
                            style={{ width: `${progress * 100}%` }}
                        />
                    </View>
                    <View className="flex-row items-center justify-between mt-2">
                        <Text className="text-xs text-blue-700">
                            {formatTime(position)}
                        </Text>
                        <Text className="text-xs text-blue-700">
                            {formatTime(duration)}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};