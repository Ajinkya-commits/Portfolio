import { type SchemaTypeDefinition } from 'sanity'
import profile from './profile'
import project from './project'
import skill from './skill'
import experience from './experience'
import education from './education'
import certification from './certification'
import contact from './contact'
import siteSettings from './siteSettings'
import navigation from './navigation'

export const schema: { types: SchemaTypeDefinition[] } = {
   types: [
    profile,
    project,
    skill,
    experience,
    education,
    certification,
    contact,
    siteSettings,
    navigation,
  ],
}
