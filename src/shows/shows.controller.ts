import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { RolesGuard } from '../auth/roles.guard';
import { ROLE } from '../users/types/user-role.type';
import { Roles } from '../auth/roles.decorator';
import { ShowsService } from './shows.service';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';


@UseGuards(RolesGuard)
@Controller('shows')
export class ShowsController {
    constructor(private readonly showsService: ShowsService) {}

    // @Get()

    // @Get(':id')

    @Roles(ROLE.ADMIN)
    @Post()
    async createShow(@Body() createShowDto: CreateShowDto) {
        return this.showsService.createShow(createShowDto);
    }

    @Roles(ROLE.ADMIN)
    @Patch(':id')
    async updateShow(@Param('id') showId: number, @Body() updateShowDto: UpdateShowDto) {
        return this.showsService.updateShow(showId, updateShowDto);
    }

    @Roles(ROLE.ADMIN)
    @Delete(':id')
    async deleteShow(@Param('id') showId: number) {
        return this.showsService.deleteShow(showId);
    }
}
