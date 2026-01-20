# Forest Mapping Dataset — Algeria

This repository provides a **representative subset of data** used in a research study on forest mapping in Algeria using noisy labels and few clean data.

The dataset is intended to support **reproducibility and methodological transparency**, not to redistribute full national-scale remote sensing datasets.

---

## 1. Overview

The forest mapping approach relies on:
- **Publicly available satellite and auxiliary data** accessed via Google Earth Engine:
  - Sentinel-2 (Copernicus / ESA)
  - ESA WorldCover
  - SRTM DEM
- A **patch-based processing strategy**
- **Noisy supervision** from global land-cover products
- A **small set of manually annotated clean forest polygons**

Due to the large volume and licensing constraints of the original datasets, **only representative sample patches and annotations are provided here**.  
The complete raw datasets remain publicly accessible through their official providers.

---

## 2. Dataset Structure

```text
forest_mapping_algeria_dataset/
├── sentinel2_patches/
│   ├── sentinel2_patch_01_s2.tif
│   └── sentinel2_patch_02_s2.tif
│
├── DEM_features/
│   ├── patch_01_dem.tif
│   ├── patch_01_slope.tif
│   └── patch_01_aspect.tif
│
├── labels/
│   ├── worldcover_noisy_labels.tif
│   └── clean_forest_polygons.geojson
│
├── scripts/
│   └── gee_figures_and_data_access.js
│
└── README.md
```
---

## 3. Sentinel-2 Image Patches

**Location:** `sentinel2_patches/`

- GeoTIFF image patches extracted from Sentinel-2 imagery
- Spatial resolution: **10 m**
- Bands included: **B2 (Blue), B3 (Green), B4 (Red), B8 (NIR)**
- Patches are spatially aligned with DEM features and labels

These patches are **examples of the inputs used during training and evaluation**.

---

## 4. DEM-Based Features

**Location:** `DEM_features/`

Derived from **SRTM DEM (30 m)** and resampled to **10 m** to match Sentinel-2:

- `patch_01_dem.tif` — elevation
- `patch_01_slope.tif` — terrain slope
- `patch_01_aspect.tif` — terrain aspect

These features provide **topographic context** for forest mapping.

---

## 5. Labels

### 5.1 Noisy Labels (ESA WorldCover)

**File:** `labels/worldcover_noisy_labels.tif`

- Binary forest mask derived from **ESA WorldCover 2020**
- Forest class corresponds to **Trees (class 10)**
- Used as **noisy supervision** during model development

---

### 5.2 Clean Labels (Manual Annotations)

**File:** `labels/clean_forest_polygons.geojson`

- Vector polygons manually digitised using high-resolution imagery
- Represent high-confidence forest regions
- These polygons were created specifically for this study and do not originate from any existing public dataset
- Used for validation and model calibration
- Only a limited number of clean annotations are provided, consistent with the “few clean data” setting

Clean labels are shared as **vector data** to preserve annotation precision and avoid redistribution of third-party imagery.

---

## 6. Notes on Data Availability

- The **full Sentinel-2, ESA WorldCover, and SRTM datasets are not redistributed** here due to their size and licensing conditions.
- All raw data sources are **publicly available** and can be accessed via Google Earth Engine.
- The files provided in this repository constitute a **minimal, representative dataset** sufficient to:
  - understand the preprocessing pipeline
  - reproduce key methodological steps
  - validate the methodological approach

---

## 7. Code (Google Earth Engine)

This repository also includes a Google Earth Engine (GEE) script used to generate the figures
and to demonstrate how the **public raw datasets** used in this study can be accessed and processed.

**Script location:**  
`scripts/gee_figures_and_data_access.js`

The script reproduces representative visualisations and preprocessing steps, including:
- ESA WorldCover land-cover map for Algeria (official color palette)
- Sentinel-2 RGB composite (median annual composite)
- DEM-based HSV visualization (aspect, slope, hillshade) with NDVI overlay

This code is provided **for reproducibility and transparency only**.  
It illustrates the data access and processing pipeline, while the full raw datasets remain
available through their official public platforms (Google Earth Engine / ESA).

---

## 8. Associated Work

This dataset is associated with an **ongoing research manuscript** on forest mapping in Algeria using noisy labels and few clean data.  
Reference information will be updated upon publication.

