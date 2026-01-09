// Instructions data for the onboarding modal
import tasksImage from './assets/tasks.jpg';
import heatmapImage from './assets/heatmap.jpg';
import settingsImage from './assets/settings.jpg';

export const instructionsData = [
    {
        id: 1,
        title: "Welcome to To-doRo!",
        content: "Your productivity companion that combines the power of the Pomodoro Technique with smart task management. Let's get you started!"
    },
    {
        id: 2,
        title: "What is the Pomodoro Technique?",
        content: "Work in focused 25-minute sessions followed by short breaks. After 3 sessions, take a longer break. This technique helps maintain focus and prevents burnout."
    },
    {
        id: 3,
        title: "Task Management",
        content: "Add, organize, and track your tasks in the todo list. Check them off as you complete them during your Pomodoro sessions for maximum productivity.",
        image: tasksImage
    },
    {
        id: 4,
        title: "Share your Progress",
        content: "Track your daily sessions and see your consistency over time. Export and Share your progress on your favorite social media!",
        image: heatmapImage
    },
    {
        id: 5,
        title: "Customization",
        content: "Personalize your experience! Change themes, adjust timer durations, and configure display settings in the Settings panel. Access it anytime via the gear icon.",
        image: settingsImage
    },
    {
        id: 6,
        title: "You're All Set!",
        content: "Start your first Pomodoro session and begin your journey to enhanced productivity. Remember: focus, break, repeat. You've got this!"
    }
];