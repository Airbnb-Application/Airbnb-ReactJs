import { FaWifi } from "react-icons/fa6";
import { PiTelevision } from "react-icons/pi";
import { FaKitchenSet } from "react-icons/fa6";
import { GiWashingMachine } from "react-icons/gi";
import { FaCar } from "react-icons/fa";
import { FaRegSnowflake } from "react-icons/fa";
import { BsPersonWorkspace } from "react-icons/bs";

import { FaSwimmingPool } from "react-icons/fa";
import { FaHotTub } from "react-icons/fa";
import { MdBalcony } from "react-icons/md";
import { MdOutlineOutdoorGrill } from "react-icons/md";
import { TbCampfire } from "react-icons/tb";
import { RiBilliardsFill } from "react-icons/ri";
import { GiGrandPiano } from "react-icons/gi";
import { CiDumbbell } from "react-icons/ci";
import { FaShower } from "react-icons/fa";
import { FaFirstAid } from "react-icons/fa";
import { FaFireExtinguisher } from "react-icons/fa";
import { id } from "date-fns/locale";

export const amenitiesArray = [
    {
        id: "wifi",
        label: 'Wifi',
        icon: FaWifi,
        description: 'This property has wifi!',
    },
    {
        id: "tv",
        label: 'TV',
        icon: PiTelevision,
        description: 'This property has a TV!',
    },
    {
        id: "kitchen",
        label: 'Kitchen',
        icon: FaKitchenSet,
        description: 'This property has a kitchen!',
    },
    {
        id: "washer",
        label: 'Washing machine',
        icon: GiWashingMachine,
        description: 'This property has a washer!',
    },
    {
        id: "parking",
        label: 'Parking',
        icon: FaCar,
        description: 'This property has parking!',
    },
    {
        id: "ac",
        label: 'AC',
        icon: FaRegSnowflake,
        description: 'This property has AC!',
    },
    {
        id: "pool",
        label: 'Pool',
        icon: FaSwimmingPool,
        description: 'This property has a pool!',
    },
    {
        id: "hotTub",
        label: 'Hot tub',
        icon: FaHotTub,
        description: 'This property has a hot tub!',
    },
    {
        id: "workspace",
        label: 'Workspace',
        icon: BsPersonWorkspace,
        description: 'This property has a workspace!',
    },
    {
        id: "balcony",
        label: 'Balcony',
        icon: MdBalcony,
        description: 'This property has a balcony!',
    },
    {
        id: "grill",
        label: 'Grill',
        icon: MdOutlineOutdoorGrill,
        description: 'This property has a grill!',
    },
    {
        id: "campfire",
        label: 'Campfire',
        icon: TbCampfire,
        description: 'This property has a campfire!',
    },
    {
        id: "billiards",
        label: 'Billiards',
        icon: RiBilliardsFill,
        description: 'This property has a billiards!',
    },
    {
        id: "piano",
        label: 'Piano',
        icon: GiGrandPiano,
        description: 'This property has a piano!',
    },
    {
        id: "gym",
        label: 'Gym',
        icon: CiDumbbell,
        description: 'This property has a gym!',
    },
    {
        id: "shower",
        label: 'Outside shower',
        icon: FaShower,
        description: 'This property has a shower!',
    },
    {
        id: "firstAid",
        label: 'First aid',
        icon: FaFirstAid,
        description: 'This property has a first aid kit!',
    },
    {
        id: "fireExtinguisher",
        label: 'Fire extinguisher',
        icon: FaFireExtinguisher,
        description: 'This property has a fire extinguisher!',
    }
]

