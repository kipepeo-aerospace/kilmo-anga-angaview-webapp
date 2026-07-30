# AngaView v2 - Product Architecture

**Version:** 2.0 (Concept)
**Platform:** AngaStack
**Status:** Product Design

---

# Vision

AngaView is an agricultural intelligence platform that helps farmers monitor the health of their farms and make better decisions using AI.

Unlike traditional drone processing software, AngaView is source-agnostic. It combines observations from multiple data sources—including mobile phones, drones and satellites—to build a continuously updated understanding of every farm.

The farmer never interacts with imagery directly. Instead, they interact with farms, insights and recommendations.

---

# Product Philosophy

The farmer's mental model should be:

> "How is my farm doing?"

Not:

> "How do I process my drone imagery?"

Technology is simply the method of collecting evidence.

---

# Product Goals

- Make farm monitoring accessible to every farmer.
- Support multiple observation sources through a single workflow.
- Build a living health record for every farm.
- Provide actionable recommendations rather than raw imagery.
- Scale seamlessly as new data sources become available.

---

# Position within AngaStack

```
                      AngaStack

         ┌─────────────────────────────┐
         │          AngaView           │
         │     Farmer Application      │
         └─────────────────────────────┘
                      │
                      ▼
         ┌─────────────────────────────┐
         │         AngaCloud           │
         │   Data & Processing Layer   │
         └─────────────────────────────┘
                      │
                      ▼
         ┌─────────────────────────────┐
         │          AngaAI             │
         │ Intelligence & Reasoning    │
         └─────────────────────────────┘
```

---

# Supported Observation Sources

## Mobile

- Plant photographs
- Disease detection
- Pest detection
- Nutrient deficiencies
- Growth stage estimation

## Drone

- RGB orthomosaics
- Multispectral imagery
- Crop health maps
- Stand counts
- Weed pressure
- Irrigation analysis

## Satellite

- Continuous monitoring
- Vegetation indices
- Historical trends
- Change detection

Future sources:

- Weather
- Soil sensors
- IoT
- Manual observations
- Machinery telemetry

---

# Core Architecture

```
                Observation Sources

      Mobile      Drone      Satellite

             │        │        │

             ▼        ▼        ▼

           Ingestion Layer

                   │

                   ▼

              AngaCloud

                   │

          Standard Observation

                   │

                   ▼

                AngaAI

                   │

      Analysis + Recommendations

                   │

                   ▼

               AngaView
```

Every source produces a common observation model.

---

# Core Domain Model

```
User

│

├── Farms

│      ├── Seasons

│      │      ├── Observations

│      │      ├── Analyses

│      │      ├── Insights

│      │      └── Recommendations

│      │

│      └── Timeline
```

---

# Primary Entity

Everything revolves around the Farm.

A Farm owns:

- metadata
- spatial boundary
- growing seasons
- observations
- analyses
- recommendations
- history

---

# Farm Object

```
Farm

Name

Crop

Boundary Polygon

Centroid

Area

Created Date

Current Season

Timeline
```

Spatial Information

```
Boundary Polygon

↓

Area Calculation

↓

Centroid

↓

Satellite Queries

↓

Drone Planning

↓

Spatial Analytics
```

The boundary polygon becomes the spatial reference for every future feature.

---

# Growing Seasons

A farm is permanent.

The crop is seasonal.

```
Farm

↓

Season

↓

Crop

↓

Observations

↓

Insights
```

This allows historical comparisons across years.

---

# Observation Model

An Observation is a single data collection event.

Examples:

- Mobile inspection
- Drone survey
- Satellite acquisition

```
Observation

↓

Assets

↓

Analysis

↓

Results
```

---

# Asset Model

Assets are physical files.

Examples:

- JPEG
- Orthomosaic
- Sentinel scene
- Thermal image

Observations reference Assets.

Assets do not contain business logic.

---

# Analysis Pipeline

```
Observation

↓

Quality Checks

↓

Crop Detection

↓

Disease Detection

↓

Nutrient Analysis

↓

Growth Stage

↓

Health Score

↓

Recommendation Engine
```

Every stage produces structured outputs.

---

# Navigation

```
Home

Farms

New Analysis

Profile
```

Simple.

Everything begins with Farms.

---

# Home

Purpose

Provide a quick overview of farm health.

```
Good afternoon.

8 Farms

2 Need Attention

5 Analyses This Week

[ Start New Analysis ]
```

---

# Farms

The primary workspace.

```
Murgusi

Maize

89% Healthy

------------------

Narok

Beans

Needs Attention

------------------

Nanyuki

Potatoes

Healthy
```

Selecting a farm opens its health record.

---

# Farm Detail

```
Farm Summary

Current Health

Insights

Recommendations

Map

Timeline

Analytics
```

This becomes the most frequently used screen.

---

# Farm Timeline

Every observation becomes history.

Example

```
Yesterday

📱 Mobile Inspection

Nitrogen deficiency

------------------

Last Week

🚁 Drone Survey

Healthy canopy

------------------

Last Month

🛰 Satellite

Stress increasing
```

---

# New Analysis

Workflow

```
Select Farm

↓

Choose Source

↓

Collect Data

↓

Process

↓

Observation Created

↓

Farm Updated
```

---

# Register Farm

## Step 1

Farm Details

- Name
- Crop
- Variety (optional)
- Planting Date (optional)

---

## Step 2

Draw Boundary

Satellite map.

User taps around field.

System calculates

- area
- centroid

Boundary becomes permanent.

No KML uploads in MVP.

---

## Step 3

Confirmation

Farm created.

---

# Maps

Maps are contextual.

Maps are not a primary navigation item.

Maps appear when needed.

Examples

- Registering a farm
- Viewing a farm
- Viewing satellite results
- Viewing drone analyses
- Navigating to mobile inspection locations

---

# Satellite Monitoring

Satellite imagery behaves like a monitoring service.

Not a file upload.

Workflow

```
Farm Boundary

↓

Retrieve Latest Imagery

↓

Clip

↓

Analyse

↓

Update Farm
```

The user simply sees

"Last satellite observation: 3 days ago."

---

# Mobile Workflow

```
Open Farm

↓

Take Photos

↓

Upload

↓

Observation Created

↓

AngaAI

↓

Farm Updated
```

---

# Drone Workflow

```
Open Farm

↓

Upload Orthomosaic

↓

Observation Created

↓

Analysis

↓

Farm Updated
```

Future

```
Farm Boundary

↓

Generate Mission

↓

QGroundControl

↓

Fly

↓

Upload

↓

Farm Updated
```

---

# Recommendations

Recommendations are generated by AngaAI.

Not hardcoded.

They consider

- observations
- history
- confidence
- crop
- season

Future

- weather
- soil
- fertilizer history

---

# Farm Health Record

Every farm maintains a continuously updated health record.

```
Current Health

Health Trend

Current Risks

Recommendations

Latest Observations

Analytics
```

This replaces the traditional static report.

Reports become exports generated from the current health record.

---

# Guiding Design Principles

- Farms are the centre of the application.
- Observations are evidence.
- Assets are files.
- Insights are the product.
- Recommendations drive action.
- Maps provide spatial context.
- Technology remains invisible wherever possible.
- Every new capability should strengthen the Farm Health Record rather than introduce a new workflow.

---

# Deferred Features

These are intentionally excluded from the MVP but should be considered during system design.

## QGroundControl Integration

Use farm boundary polygons to automatically generate drone flight plans.

---

## Automatic Field Boundary Detection

Assist farmers by suggesting field boundaries from satellite imagery.

---

## Weather Integration

Include weather forecasts and historical conditions in recommendation generation.

---

## Offline Mobile Inspections

Allow observations to be collected without network connectivity and synchronised later.

---

## Push Notifications

Notify farmers when:

- crop stress increases
- satellite detects anomalies
- follow-up inspections are recommended
- new recommendations become available

---

# Long-Term Vision

AngaView is not a drone platform.

It is not a satellite platform.

It is not a mobile diagnosis application.

AngaView is the farmer's digital representation of every farm—a continuously evolving health record powered by AngaStack.

Every observation, regardless of source, contributes to a richer understanding of the farm, enabling better decisions through AI-driven insights and recommendations.