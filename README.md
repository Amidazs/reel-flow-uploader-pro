
# AutoReel Uploader

A tool for creators to simplify their social media workflow. Upload once, publish everywhere.

## Features

- Upload videos to multiple platforms (TikTok, YouTube Shorts, Facebook Reels)
- Manage metadata for each platform
- Track video performance
- Customize upload settings
- View analytics across all platforms

## Installation Instructions

### Prerequisites

- Node.js and npm installed
- For Android: Android Studio installed
- For Windows: Electron builder

### Setting Up the Project

1. Clone the repository from GitHub
2. Run `npm install` to install dependencies

### Building for Android

1. Run `npm run build` to build the web app
2. Run `npx cap add android` (first time only)
3. Run `npx cap sync` to sync the web app with the Android project
4. Run `npx cap open android` to open the project in Android Studio
5. Build the APK from Android Studio

### Building for Windows (as EXE)

To build an EXE file for Windows, you'll need to integrate Electron:

1. Install Electron: `npm install electron electron-builder --save-dev`
2. Create main.js in the project root
3. Update package.json with Electron build configuration
4. Run `npm run electron:build` to create the EXE file

## Using the App

1. Connect your social media accounts in Settings
2. Upload a video from the Dashboard
3. Customize metadata for each platform
4. Publish to all platforms simultaneously
5. Track performance in the Analytics section

## Troubleshooting

If you encounter issues:
- Check that your API keys are valid
- Verify your network connection
- Ensure video formats are supported (MP4, MOV, WEBM)
- Check console logs for detailed error information

## For Personal Use

This app is configured for personal use and includes everything needed to manage your social media video uploads efficiently.
