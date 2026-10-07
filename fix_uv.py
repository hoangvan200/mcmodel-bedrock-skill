import json
import os

# 1. Update paving_block_full
with open('output/paving_block_full.geo.json', 'r') as f:
    data = json.load(f)

cube = data['minecraft:geometry'][0]['bones'][0]['cubes'][0]
cube['uv'] = {
    "north": {"uv": [0, 0], "uv_size": [64, 64]},
    "south": {"uv": [0, 0], "uv_size": [64, 64]},
    "east": {"uv": [0, 0], "uv_size": [64, 64]},
    "west": {"uv": [0, 0], "uv_size": [64, 64]},
    "up": {"uv": [0, 0], "uv_size": [64, 64]},
    "down": {"uv": [0, 0], "uv_size": [64, 64]}
}
with open('output/paving_block_full.geo.json', 'w') as f:
    json.dump(data, f, indent=2)

# 2. Update paving_block_carpet
with open('output/paving_block_carpet.geo.json', 'r') as f:
    data = json.load(f)

cube = data['minecraft:geometry'][0]['bones'][0]['cubes'][0]
# Carpet sides are 1 unit high, so 4 pixels out of 64
cube['uv'] = {
    "north": {"uv": [0, 0], "uv_size": [64, 4]},
    "south": {"uv": [0, 0], "uv_size": [64, 4]},
    "east": {"uv": [0, 0], "uv_size": [64, 4]},
    "west": {"uv": [0, 0], "uv_size": [64, 4]},
    "up": {"uv": [0, 0], "uv_size": [64, 64]},
    "down": {"uv": [0, 0], "uv_size": [64, 64]}
}
with open('output/paving_block_carpet.geo.json', 'w') as f:
    json.dump(data, f, indent=2)
