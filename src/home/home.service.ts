import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHomeDto, HomeResponseDto } from './dto/home.dto';
import { PropertyType } from '@prisma/client';

interface GetHomesParam {
  city?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
  propertyType?: PropertyType;
}

export const homeSelect = {
  id: true,
  address: true,
  city: true,
  price: true,
  propertyType: true,
  number_of_bathrooms: true,
  number_of_bedrooms: true,
};

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}

  async getHomes(filter: GetHomesParam): Promise<HomeResponseDto[]> {
    const homes = await this.prismaService.home.findMany({
      select: {
        ...homeSelect,
        images: {
          select: {
            url: true,
          },
          // take: 1,     //already done inside map
        },
      },
      where: filter,
    });

    if (!homes.length) {
      throw new NotFoundException();
    }

    return homes.map((home) => {
      //we need only 1 image for each home
      const fetchHome = { ...home, image: home.images[0].url };
      delete fetchHome.images;
      return new HomeResponseDto(fetchHome);
    });
  }

  async getHome(id: number): Promise<HomeResponseDto> {
    const home = await this.prismaService.home.findUnique({
      select: {
        ...homeSelect,
        images: {
          select: { url: true },
        },
        realtor: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      where: { id },
    });
    if (!home) {
      throw new NotFoundException();
    }

    return new HomeResponseDto(home);
  }

  createHome(body: CreateHomeDto) {}
}
