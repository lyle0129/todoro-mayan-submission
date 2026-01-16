// Instructions data for the onboarding modal
import tasksImage from './assets/tasks.jpg';
import heatmapImage from './assets/heatmap.jpg';
import settingsImage from './assets/settings.jpg';
import searchTaskVideo from './assets/searchtask-functionality.mp4';
import dragDropVideo from './assets/rearrange-by-drag-and-drop.mp4';
import showPomodoroVideo from './assets/show-pomodorotimer.mp4';

export const instructionsData = [
    {
        id: 1,
        title: "Welcome to To-doRo!",
        content: "Your productivity companion that combines smart task management with the Pomodoro Technique. Let's explore what you can do!"
    },
    {
        id: 2,
        title: "Create and Manage Tasks",
        content: "Add tasks using the input field, mark them complete with the checkmark, edit with the pencil icon, or delete with the trash icon. Track your progress with the completion percentage bar at the top.",
        image: tasksImage
    },
    {
        id: 3,
        title: "Search Your Tasks",
        content: "Use the search bar to quickly find specific tasks in both your active and completed lists. Perfect for when your task list grows!",
        image: searchTaskVideo
    },
    {
        id: 4,
        title: "Organize with Drag & Drop",
        content: "Reorder your tasks by dragging and dropping them. Prioritize what matters most and keep your workflow organized your way.",
        image: dragDropVideo
    },
    {
        id: 5,
        title: "Toggle the Pomodoro Timer",
        content: "Show or hide the Pomodoro timer using the Timer button. Work in focused 25-minute sessions with breaks to boost your productivity!",
        image: showPomodoroVideo
    },
    {
        id: 6,
        title: "Track Your Progress",
        content: "View your daily Pomodoro sessions in the heatmap. Export and share your productivity streak on social media to stay motivated!",
        image: heatmapImage
    },
    {
        id: 7,
        title: "Customize Your Experience",
        content: "Access Settings via the gear icon to change themes, adjust timer durations, and configure display preferences. Make To-doRo truly yours!",
        image: settingsImage
    },
    {
        id: 8,
        title: "You're Ready to Go!",
        content: "Start adding tasks and begin your first focused session. Remember: plan, focus, accomplish. You've got this!"
    }
];