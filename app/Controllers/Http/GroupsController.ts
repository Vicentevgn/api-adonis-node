import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { UserFactory } from 'Database/factories'

export default class GroupsController {
    public async store({request, response}: HttpContextContract) {        
        return response.created({})
    }
}
