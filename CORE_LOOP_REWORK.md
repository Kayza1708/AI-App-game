# Core Economy Rework

The active run economy is now deliberately small:

`Credits → Hardware → Compute → Users → Credits`

Hardware produces Compute per second. Efficiency determines Compute consumed per User, so `UserCapacity = Compute/s ÷ ComputePerUser`; capacity is always fully utilized and therefore `Users = Capacity`. Every User automatically earns `RevenuePerUser`, and `Credits/s = Users × RevenuePerUser`. Manual Optimize clicks add stored Compute directly and can be consumed by active Training.

Training awards Model Points that can be spent only on **Quality** or **Efficiency**. Quality raises Revenue/User. Efficiency lowers Compute/User and therefore raises Users for unchanged Hardware. Popularity is not an active Training stat.

Hardware Compute also generates Research Points automatically. The existing Research project and Technology trees remain the upgrade surface for Hardware, Training, Quality, Efficiency, Credits, clicking, Research, automation, and Patents; there is no manual Compute allocation UI.

Patents are purchased/researched with Research Points. Every discovered Patent is permanently active, there is no equipped-Patent limit or Patent-slot purchase, and INT continues to level discovered Patents. Development Cycles and cumulative INT entitlement remain intact.

Legacy save fields for Market and allocation are retained only as inert migration data so existing saves can load safely. They are not exposed in navigation and do not enter the active Core Loop.

## Training, Research, and achievements

Training consumes tap-generated Stored Compute first and also receives a fixed parallel share of Hardware Compute/s. It never subtracts from User capacity. Every completion grants exactly one Model Level and one Model Point; the only normal point paths are Quality and Efficiency. Research Points are likewise generated in parallel from Hardware Compute/s, and Labs spend those points without reserving capacity. The seven-branch, 27-node Research Tree is run progression and resets on a Development Cycle; Patents and INT remain separate permanent systems.

The long-term Achievement catalog contains 46 goals across Hardware, Compute/Economy/Users, Training, Quality/Efficiency, Research, Development/INT, Patents, Active/Tapping, and Secret categories. Each card exposes its description, progress, reward, and status. Achievement timestamps live in `meta.achievements`, which is preserved by Development Cycles and Breakthroughs.

## Compatibility boundary

`allocation` and `market` remain normalized in version-24 saves solely so historical saves and analytics payloads deserialize safely. Runtime capacity, revenue, Training, Research generation, goals, missions, navigation, and tutorials do not read those values. Removing the serialized fields is deferred to a future destructive save-format migration.
