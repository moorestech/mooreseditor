import blocks from './schema/blocks.json';
import items from './schema/items.json';
import challenge from './schema/challenges.json';
import craftRecipes from './schema/craftRecipes.json';
import mapObjects from './schema/mapObjects.json';
import machineRecipes from './schema/machineRecipes.json';
import schemaSample from './schema/schemaSample.json';
import inventoryConnects from './schema/ref/inventoryConnects.json';
import gearConnects from './schema/ref/gearConnects.json';
import blockConnectInfo from './schema/ref/blockConnectInfo.json';
import mineSettings from './schema/ref/mineSettings.json';
import mapObjectMineSettings from './schema/ref/mapObjectMineSettings.json';
import { RefResolver } from 'json-schema-ref-resolver'
import Ajv from 'ajv';

const refResolver = new RefResolver()
refResolver.addSchema(items)
refResolver.addSchema(blocks)
refResolver.addSchema(challenge)
refResolver.addSchema(craftRecipes)
refResolver.addSchema(mapObjects)
refResolver.addSchema(machineRecipes)
refResolver.addSchema(schemaSample)

refResolver.addSchema(inventoryConnects)
refResolver.addSchema(gearConnects)
refResolver.addSchema(blockConnectInfo)
refResolver.addSchema(mineSettings)
refResolver.addSchema(mapObjectMineSettings)

const ajv = new Ajv({ allErrors: true })
ajv.addSchema(refResolver.getDerefSchema('blocks'), '/blocks')
ajv.addSchema(refResolver.getDerefSchema('items'), '/items')
ajv.addSchema(refResolver.getDerefSchema('craftRecipes'), '/craftRecipes')
ajv.addSchema(refResolver.getDerefSchema('challenges'), '/challenges')
ajv.addSchema(refResolver.getDerefSchema('mapObjects'), '/mapObjects')
ajv.addSchema(refResolver.getDerefSchema('machineRecipes'), '/machineRecipes')
ajv.addSchema(refResolver.getDerefSchema('schemaSample'), '/schemaSample')

export default {
  validator: ajv,
  schemas: {
    items: {
      name: 'Items',
      schema: refResolver.getDerefSchema('items')
    },
    blocks: {
      name: 'Blocks',
      schema: refResolver.getDerefSchema('blocks')
    },
    mapObjects: {
      name: 'MapObjects',
      schema: refResolver.getDerefSchema('mapObjects')
    },
    craftRecipes: {
      name: 'CraftRecipes',
      schema: refResolver.getDerefSchema('craftRecipes')
    },
    machineRecipes: {
      name: 'MachineRecipes',
      schema: refResolver.getDerefSchema('machineRecipes')
    },
    challenges: {
      name: 'Challenges',
      schema: refResolver.getDerefSchema('challenges')
    },
    schemaSample: {
      name: 'サンプル',
      schema: refResolver.getDerefSchema('schemaSample')
    },
  }
}
