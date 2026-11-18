window.SDGS_DATA = {
  "version": "0.2-preliminary",
  "baseResourceIncomePerYear": 3,
  "baseEnvironmentBurdenPerYear": 1,
  "startState": {
    "resources": 30,
    "environment": 50,
    "technology": 20
  },
  "endingThresholds": {
    "lowEnvironmentMax": 39,
    "highTechnologyMin": 60
  },
  "cards": [
    {
      "id": "E01",
      "imageId": "E01",
      "name": "火力発電所の建設",
      "category": "energy",
      "cost": 8,
      "requiredTechnology": 0,
      "instantEffect": {
        "resources": 0,
        "environment": 0,
        "technology": 0
      },
      "ongoingEffect": {
        "durationYears": 4,
        "startsNextYear": true,
        "resourcesPerYear": 6,
        "environmentPerYear": 4,
        "maintenanceCostPerYear": 0
      },
      "delayedResearch": null,
      "notes": null
    },
    {
      "id": "E02",
      "imageId": "E02",
      "name": "太陽光発電所の建設",
      "category": "energy",
      "cost": 12,
      "requiredTechnology": 0,
      "instantEffect": {
        "resources": 0,
        "environment": 0,
        "technology": 0
      },
      "ongoingEffect": {
        "durationYears": 5,
        "startsNextYear": true,
        "resourcesPerYear": 5,
        "environmentPerYear": 0,
        "maintenanceCostPerYear": 0
      },
      "delayedResearch": null,
      "notes": null
    },
    {
      "id": "E03",
      "imageId": "E03",
      "name": "洋上風力発電所の建設",
      "category": "energy",
      "cost": 16,
      "requiredTechnology": 35,
      "instantEffect": {
        "resources": 0,
        "environment": 0,
        "technology": 0
      },
      "ongoingEffect": {
        "durationYears": 5,
        "startsNextYear": true,
        "resourcesPerYear": 7,
        "environmentPerYear": 0,
        "maintenanceCostPerYear": 0
      },
      "delayedResearch": null,
      "notes": null
    },
    {
      "id": "E04",
      "imageId": "E04",
      "name": "小規模水力発電",
      "category": "energy",
      "cost": 9,
      "requiredTechnology": 0,
      "instantEffect": {
        "resources": 0,
        "environment": 0,
        "technology": 0
      },
      "ongoingEffect": {
        "durationYears": 5,
        "startsNextYear": true,
        "resourcesPerYear": 3,
        "environmentPerYear": 1,
        "maintenanceCostPerYear": 0
      },
      "delayedResearch": null,
      "notes": null
    },
    {
      "id": "E05",
      "imageId": "E05",
      "name": "天然ガス火力発電",
      "category": "energy",
      "cost": 11,
      "requiredTechnology": 0,
      "instantEffect": {
        "resources": 0,
        "environment": 0,
        "technology": 0
      },
      "ongoingEffect": {
        "durationYears": 5,
        "startsNextYear": true,
        "resourcesPerYear": 5,
        "environmentPerYear": 2,
        "maintenanceCostPerYear": 0
      },
      "delayedResearch": null,
      "notes": null
    },
    {
      "id": "E06",
      "imageId": "E06",
      "name": "地熱発電所",
      "category": "energy",
      "cost": 16,
      "requiredTechnology": 40,
      "instantEffect": {
        "resources": 0,
        "environment": 2,
        "technology": 0
      },
      "ongoingEffect": {
        "durationYears": 6,
        "startsNextYear": true,
        "resourcesPerYear": 5,
        "environmentPerYear": 0,
        "maintenanceCostPerYear": 0
      },
      "delayedResearch": null,
      "notes": null
    },
    {
      "id": "E07",
      "imageId": "E07",
      "name": "次世代原子力発電",
      "category": "energy",
      "cost": 22,
      "requiredTechnology": 50,
      "instantEffect": {
        "resources": 0,
        "environment": 2,
        "technology": 0
      },
      "ongoingEffect": {
        "durationYears": 6,
        "startsNextYear": true,
        "resourcesPerYear": 9,
        "environmentPerYear": 1,
        "maintenanceCostPerYear": 0
      },
      "delayedResearch": null,
      "notes": null
    },
    {
      "id": "N01",
      "imageId": "N01",
      "name": "ごみ削減キャンペーン",
      "category": "env",
      "cost": 0,
      "requiredTechnology": 0,
      "instantEffect": {
        "resources": 0,
        "environment": -1,
        "technology": 0
      },
      "ongoingEffect": null,
      "delayedResearch": null,
      "notes": null
    },
    {
      "id": "N02",
      "imageId": "N02",
      "name": "河川汚染の除去",
      "category": "env",
      "cost": 7,
      "requiredTechnology": 0,
      "instantEffect": {
        "resources": 0,
        "environment": -6,
        "technology": 0
      },
      "ongoingEffect": null,
      "delayedResearch": null,
      "notes": null
    },
    {
      "id": "N03",
      "imageId": "N03",
      "name": "森林再生プロジェクト",
      "category": "env",
      "cost": 10,
      "requiredTechnology": 0,
      "instantEffect": {
        "resources": 0,
        "environment": 0,
        "technology": 0
      },
      "ongoingEffect": {
        "durationYears": 4,
        "startsNextYear": true,
        "resourcesPerYear": 0,
        "environmentPerYear": -4,
        "maintenanceCostPerYear": 1
      },
      "delayedResearch": null,
      "notes": null
    },
    {
      "id": "N04",
      "imageId": "N04",
      "name": "省エネルギー設備導入",
      "category": "env",
      "cost": 7,
      "requiredTechnology": 0,
      "instantEffect": {
        "resources": 0,
        "environment": -2,
        "technology": 0
      },
      "ongoingEffect": {
        "durationYears": 4,
        "startsNextYear": true,
        "resourcesPerYear": 1,
        "environmentPerYear": -1,
        "maintenanceCostPerYear": 0
      },
      "delayedResearch": null,
      "notes": null
    },
    {
      "id": "N05",
      "imageId": "N05",
      "name": "工場の排出対策",
      "category": "env",
      "cost": 6,
      "requiredTechnology": 0,
      "instantEffect": {
        "resources": 0,
        "environment": 0,
        "technology": 0
      },
      "ongoingEffect": {
        "durationYears": 4,
        "startsNextYear": true,
        "resourcesPerYear": 0,
        "environmentPerYear": -3,
        "maintenanceCostPerYear": 1
      },
      "delayedResearch": null,
      "notes": null
    },
    {
      "id": "N06",
      "imageId": "N06",
      "name": "都市緑化計画",
      "category": "env",
      "cost": 5,
      "requiredTechnology": 0,
      "instantEffect": {
        "resources": 0,
        "environment": -2,
        "technology": 0
      },
      "ongoingEffect": {
        "durationYears": 3,
        "startsNextYear": true,
        "resourcesPerYear": 0,
        "environmentPerYear": -1,
        "maintenanceCostPerYear": 0
      },
      "delayedResearch": null,
      "notes": null
    },
    {
      "id": "N07",
      "imageId": "N07",
      "name": "湿地の保全・再生",
      "category": "env",
      "cost": 8,
      "requiredTechnology": 0,
      "instantEffect": {
        "resources": 0,
        "environment": 0,
        "technology": 0
      },
      "ongoingEffect": {
        "durationYears": 5,
        "startsNextYear": true,
        "resourcesPerYear": 0,
        "environmentPerYear": -2,
        "maintenanceCostPerYear": 0
      },
      "delayedResearch": null,
      "notes": null
    },
    {
      "id": "N08",
      "imageId": "N08",
      "name": "高度防災ネットワーク",
      "category": "env",
      "cost": 8,
      "requiredTechnology": 35,
      "instantEffect": {
        "resources": 0,
        "environment": 0,
        "technology": 0
      },
      "ongoingEffect": {
        "durationYears": 5,
        "startsNextYear": true,
        "resourcesPerYear": 0,
        "environmentPerYear": 0,
        "maintenanceCostPerYear": 1
      },
      "delayedResearch": null,
      "notes": null,
      "special": {
        "kind": "climate_damage_reduction",
        "multiplier": 0.7
      }
    },
    {
      "id": "S01",
      "imageId": "S01",
      "name": "研究情報の公開・共有",
      "category": "science",
      "cost": 0,
      "requiredTechnology": 0,
      "instantEffect": {
        "resources": 0,
        "environment": 0,
        "technology": 1
      },
      "ongoingEffect": null,
      "delayedResearch": null,
      "notes": null
    },
    {
      "id": "S02",
      "imageId": "S02",
      "name": "基礎研究への集中投資",
      "category": "science",
      "cost": 7,
      "requiredTechnology": 0,
      "instantEffect": {
        "resources": 0,
        "environment": 0,
        "technology": 5
      },
      "ongoingEffect": null,
      "delayedResearch": null,
      "notes": null
    },
    {
      "id": "S03",
      "imageId": "S03",
      "name": "次世代蓄電技術の研究",
      "category": "science",
      "cost": 15,
      "requiredTechnology": 30,
      "instantEffect": {
        "resources": 0,
        "environment": 0,
        "technology": 0
      },
      "ongoingEffect": null,
      "delayedResearch": {
        "yearsUntilCompletion": 2,
        "technology": 12,
        "environment": 0
      },
      "notes": null
    },
    {
      "id": "S04",
      "imageId": "S04",
      "name": "資源利用効率の研究",
      "category": "science",
      "cost": 6,
      "requiredTechnology": 0,
      "instantEffect": {
        "resources": 2,
        "environment": 0,
        "technology": 3
      },
      "ongoingEffect": null,
      "delayedResearch": null,
      "notes": null
    },
    {
      "id": "S05",
      "imageId": "S05",
      "name": "再エネ効率向上研究",
      "category": "science",
      "cost": 8,
      "requiredTechnology": 35,
      "instantEffect": {
        "resources": 0,
        "environment": 0,
        "technology": 5
      },
      "ongoingEffect": {
        "durationYears": 3,
        "startsNextYear": true,
        "resourcesPerYear": 0,
        "environmentPerYear": 0,
        "maintenanceCostPerYear": 0
      },
      "delayedResearch": null,
      "notes": null,
      "special": {
        "kind": "renewable_output_bonus",
        "resourcesPerFacilityYear": 1,
        "facilityIds": [
          "E02",
          "E03",
          "E04",
          "E06"
        ]
      }
    },
    {
      "id": "S06",
      "imageId": "S06",
      "name": "災害予測の基礎研究",
      "category": "science",
      "cost": 8,
      "requiredTechnology": 0,
      "instantEffect": {
        "resources": 0,
        "environment": 0,
        "technology": 3
      },
      "ongoingEffect": {
        "durationYears": 3,
        "startsNextYear": true,
        "resourcesPerYear": 0,
        "environmentPerYear": 0,
        "maintenanceCostPerYear": 0
      },
      "delayedResearch": null,
      "notes": null,
      "special": {
        "kind": "climate_damage_reduction",
        "multiplier": 0.8
      }
    },
    {
      "id": "S07",
      "imageId": "S07",
      "name": "脱炭素産業技術の研究",
      "category": "science",
      "cost": 13,
      "requiredTechnology": 45,
      "instantEffect": {
        "resources": 0,
        "environment": 0,
        "technology": 0
      },
      "ongoingEffect": null,
      "delayedResearch": {
        "yearsUntilCompletion": 1,
        "technology": 9,
        "environment": 0
      },
      "notes": null
    },
    {
      "id": "S08",
      "imageId": "S08",
      "name": "CO₂回収・貯留技術の研究・実証",
      "category": "science",
      "cost": 13,
      "requiredTechnology": 45,
      "instantEffect": {
        "resources": 0,
        "environment": 0,
        "technology": 0
      },
      "ongoingEffect": null,
      "delayedResearch": {
        "yearsUntilCompletion": 2,
        "technology": 11,
        "environment": -6
      },
      "notes": null
    },
    {
      "id": "M01",
      "imageId": "M01",
      "name": "エネルギー施設の管理",
      "category": "manage",
      "cost": 0,
      "requiredTechnology": 0,
      "instantEffect": {
        "resources": 0,
        "environment": 0,
        "technology": 0
      },
      "ongoingEffect": null,
      "delayedResearch": null,
      "notes": "施設管理は対象施設別の操作データ参照",
      "management": {
        "decommissionCost": 0,
        "upgrade": {
          "E01": [
            8,
            2,
            1
          ],
          "E02": [
            8,
            2,
            0
          ],
          "E03": [
            9,
            2,
            0
          ],
          "E04": [
            6,
            1,
            0
          ],
          "E05": [
            8,
            2,
            1
          ],
          "E06": [
            9,
            2,
            0
          ],
          "E07": [
            12,
            3,
            1
          ]
        },
        "extensionCost": {
          "E01": 6,
          "E02": 6,
          "E03": 7,
          "E04": 5,
          "E05": 6,
          "E06": 8,
          "E07": 10
        },
        "extensionYears": 2
      }
    }
  ]
};
