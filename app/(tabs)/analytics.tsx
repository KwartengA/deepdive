import { View, Text, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from "react-native-safe-area-context";
import { BarChart, ProgressChart } from "react-native-chart-kit";
import StatCard from "@/components/StatCard";

const screenWidth = Dimensions.get("window").width;

export default function Analytics() {
    const activityData = {
        labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        datasets: [{ data: [] }]
    };

    const chartConfig = {
        backgroundColor: "#ffffff",
        backgroundGradientFrom: "#ffffff",
        backgroundGradientTo: "#ffffff",
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar hidden />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
                className="px-4 pt-4"
            >
                <StatCard title="Most Day Active">
                    <BarChart
                        data={activityData}
                        width={screenWidth - 72}
                        height={220}
                        chartConfig={chartConfig}
                        fromZero
                        yAxisLabel=""
                        yAxisSuffix=""
                        withInnerLines={false}
                        withHorizontalLabels={false}
                    />
                </StatCard>

                <StatCard title="Rating">
                    <View className="items-center py-6">
                        <ProgressChart
                            data={{ data: [0.68] }}
                            width={screenWidth - 72}
                            height={180}
                            strokeWidth={16}
                            radius={70}
                            chartConfig={chartConfig}
                            hideLegend
                        />
                        <View className="absolute top-20 items-center">
                        </View>
                        <TouchableOpacity className="mt-4 px-6 py-2 bg-gray-100 rounded-full">
                            <Text className="text-sm font-medium">Show details</Text>
                        </TouchableOpacity>
                    </View>
                </StatCard>
            </ScrollView>
        </SafeAreaView>
    );
}