import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHomeDto, HomeResponseDto, UpdateHomeDto } from './dto/home.dto';
import { PropertyType } from '@prisma/client';
import { UserInfo } from 'src/user/decorators/user.decorator';

interface GetHomesParam {
  city?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
  propertyType?: PropertyType;
}

interface CreateHomeParams {
  address: string;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  city: string;
  price: number;
  landSize: number;
  propertyType: PropertyType;
  images: { url: string }[];
}

// interface UpdateHomeParams {
//   address?: string;
//   numberOfBedrooms?: number;
//   numberOfBathrooms?: number;
//   city?: string;
//   price?: number;
//   landSize?: number;
//   propertyType?: PropertyType;
// }

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

  async createHome(
    {
      address,
      numberOfBedrooms,
      numberOfBathrooms,
      city,
      price,
      landSize,
      propertyType,
      images,
    }: CreateHomeParams,
    userId: number,
  ) {
    const home = await this.prismaService.home.create({
      data: {
        address,
        number_of_bedrooms: numberOfBedrooms,
        number_of_bathrooms: numberOfBathrooms,
        city,
        price,
        land_size: landSize,
        propertyType,
        realtor_id: userId,
      },
    });

    const homeImages = images.map((image) => ({ ...image, home_id: home.id }));
    await this.prismaService.image.createMany({ data: homeImages });

    return new HomeResponseDto(home);
  }

  async updateHome(
    id: number,
    {
      address,
      numberOfBedrooms,
      numberOfBathrooms,
      city,
      price,
      landSize,
      propertyType,
    }: UpdateHomeDto,
  ) {
    const home = await this.prismaService.home.findUnique({ where: { id } });
    if (!home) {
      throw new NotFoundException();
    }

    const updatedHome = await this.prismaService.home.update({
      data: {
        address,
        number_of_bedrooms: numberOfBedrooms,
        number_of_bathrooms: numberOfBathrooms,
        city,
        price,
        land_size: landSize,
        propertyType,
      },

      where: {
        id,
      },
    });

    return new HomeResponseDto(updatedHome);
  }

  async deleteHome(id: number) {
    const home = await this.prismaService.home.findUnique({ where: { id } });

    if (!home) {
      throw new NotFoundException();
    }

    await this.prismaService.image.deleteMany({ where: { home_id: id } });
    await this.prismaService.home.delete({ where: { id } });
  }

  async getRealtorByHomeId(id: number) {
    const home = await this.prismaService.home.findUnique({
      where: { id },
      select: {
        realtor: {
          select: {
            name: true,
            id: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!home) {
      throw new NotFoundException();
    }
    return home.realtor;
  }

  async inquire(buyer: UserInfo, homeId: number, message: string) {
    const realtor = await this.getRealtorByHomeId(homeId);
    return this.prismaService.message.create({
      data: {
        message,
        home_id: homeId,
        realtor_id: realtor.id,
        buyer_id: buyer.id,
      },
    });
  }

  getHomeMessages(homeId: number) {
    return this.prismaService.message.findMany({
      where: { home_id: homeId },
      select: {
        message: true,
        buyer: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });
  }
}
