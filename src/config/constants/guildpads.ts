import { GuildpadConfig } from './types'
import TankWarsZoneGuildpad from './Guildpads/TankWarsZone'
import TankWarsZoneGuildpad2 from './Guildpads/TankWarsZone2'
import DemoleGuildpad from './Guildpads/Demole'
import WizardiaGuildpad from './Guildpads/Wizardia'

const Guildpads: GuildpadConfig[] = [
  {
    id: 1,
    title: 'TankWars Zone',
    nextRoundID: 2,
    ... TankWarsZoneGuildpad
  },
  {
    id: 2,
    title: 'TankWars Zone (Round 2)',
    ... TankWarsZoneGuildpad2
  },
  {
    id: 4,
    title: 'Demole',
    ... DemoleGuildpad
  },
  {
    id: 5,
    title: 'Wizardia',
    ... WizardiaGuildpad
  }
]

export default Guildpads
