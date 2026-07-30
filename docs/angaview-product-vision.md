# AngaView Product Vision & Information Architecture

## Overview

AngaView is evolving from a drone imagery processing platform into an agricultural intelligence platform.

The objective is no longer to process aerial imagery—it is to help farmers understand the health of their crops and make better decisions, regardless of where the data comes from.

---

# Core Philosophy

Farmers do not care about imagery.

They care about questions like:

- How is my crop doing?
- Is there a disease?
- What should I do?
- Is the situation getting better or worse?

Every feature in AngaView should answer one of those questions.

---

# Product Positioning

Instead of:

> Upload drone imagery → Process → Download report

The workflow becomes:

> Analyse Farm → Receive Insights → Take Action

The imagery simply becomes one source of evidence.

---

# Data Sources

AngaView supports multiple ingestion methods.

## Mobile

- Take photos of individual plants
- Upload existing photos
- Disease detection
- Pest detection
- Nutrient deficiency detection
- Growth stage estimation

## Drone

- RGB orthomosaics
- Multispectral imagery
- Field-wide crop health
- Weed pressure
- Stand counts
- Stress mapping

## Satellite

- Historical monitoring
- Large-scale crop health
- Vegetation trends
- Seasonal comparisons

Future sources may include:

- IoT sensors
- Soil sensors
- Weather data
- Tractor-mounted cameras
- Manual observations

---

# Architectural Principle

Every data source enters through an ingestion layer before reaching a common analysis engine.

```
                 Mobile
                    │
                 Drone
                    │
               Satellite
                    │
         ───────────────────
           Ingestion Layer
         ───────────────────
                    │
          Common Analysis Engine
                    │
        Insights & Recommendations
                    │
               Farm Timeline
```

The analysis engine should not care where the data originated.

Instead it receives a standardised analysis request.

Example:

```ts
AnalysisRequest {
    farmId,
    crop,
    source,
    images,
    metadata,
    location
}
```

The only difference between mobile, drone and satellite is the preprocessing stage.

---

# Primary Entity

The Farm becomes the centre of the application.

Everything else belongs to a farm.

Hierarchy:

Farm

→ Analyses

→ Images

→ Reports

→ Insights

→ Recommendations

The farm is permanent.

Analyses are events.

Images are evidence.

Insights are the product.

---

# Application Structure

Navigation

```
Home

Farms

New Analysis

Profile
```

---

# Home

Purpose:

Provide an overview of the user's farms.

Example:

```
Good afternoon.

8 Farms

2 Need Attention

5 Analyses This Week

[ Start New Analysis ]
```

The dashboard focuses on crop health rather than operational statistics.

Instead of:

- Images Uploaded
- Processing Jobs
- Days Active

Prefer:

- Farms
- Recent Analyses
- Farms Needing Attention
- Average Health Score

---

# Farms Page

Displays all registered farms.

Example:

```
🌽 Murgusi

Maize

Health: 89%

Last analysed yesterday

--------------------

🫘 Narok

Beans

Disease detected

--------------------

🥔 Nanyuki

Potatoes

Monitoring
```

The farm list becomes the main workspace.

---

# Farm Detail Page

This is expected to become the page farmers spend the most time on.

Example layout:

```
Murgusi Farm

Maize

Health Score

89%

Area

4.2 Acres

Last Analysis

Yesterday

--------------------------------

Insights

✓ Healthy canopy

⚠ Early nitrogen stress

✓ Adequate moisture

--------------------------------

Recommendations

• Apply CAN

• Inspect western section

• Repeat analysis in 7 days

--------------------------------

Recent Analyses

Yesterday

📱 Mobile

Last Week

🚁 Drone

Last Month

🛰 Satellite

--------------------------------

Analytics

Health Trend

Disease History

Growth History

NDVI Trend
```

---

# New Analysis

Workflow:

```
Select Farm

↓

Choose Data Source

↓

Collect Data

↓

Analyse

↓

Automatically attach analysis to farm
```

Data Source Selection:

```
📱 Mobile Photo

🚁 Drone Survey

🛰 Satellite Imagery
```

Every workflow converges after ingestion.

---

# Farm Timeline

Every analysis becomes part of the farm history.

Example:

```
Today

📱 Mobile Inspection

Nitrogen deficiency detected.

------------------------

Last Week

🚁 Drone Survey

Healthy canopy.

------------------------

Last Month

🛰 Satellite

Crop stress increasing.
```

This creates a longitudinal understanding of the farm.

---

# Gallery

Current implementation:

Gallery stores uploaded imagery.

Future direction:

Gallery disappears as a primary feature.

Images become attachments inside analyses.

Users care about observations rather than image files.

---

# Reports

Reports no longer become the centre of the application.

Instead:

Farm

↓

Analysis

↓

Insights

↓

Recommendations

Reports become exportable summaries rather than the primary object.

---

# Product Model

Farm
│
├── Metadata
├── Crop
├── Location
├── Area
│
├── Analyses
│     ├── Mobile
│     ├── Drone
│     └── Satellite
│
├── Analytics
│
├── Current Insights
│
├── Recommendations
│
└── Timeline

---

# Core Design Principle

The farmer should never think about technology.

The farmer should think about farms.

Technology only appears when selecting how to perform an analysis.

Not:

> Process Drone Images

Instead:

> Start New Analysis

---

# Long-Term Vision

AngaView becomes the intelligence platform.

Kilimo Anga becomes one method of collecting data.

Future architecture supports unlimited data sources without redesigning the dashboard.

Every new source simply becomes another ingestion adapter feeding the same analysis engine.

The user experience remains unchanged.

---

# Key Product Shift

Today:

AngaView manages imagery.

Future:

AngaView manages agricultural intelligence.

This distinction should guide every future design and engineering decision.