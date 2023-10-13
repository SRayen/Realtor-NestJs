import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeService, homeSelect } from './home.service';
import { PropertyType } from '@prisma/client';

const mockGetHomes = [
  {
    id: 1,
    address: '15444 - Rue de Tunis',
    city: 'Sousse',
    price: 770000,
    propertyType: PropertyType.RESIDENTIAL,
    image: 'img1',
    numberOfBedrooms: 5,
    numberOfBathrooms: 2,
    //normally prisma returns images also:
    images: [
      {
        url: 'src1',
      },
    ],
  },
];

const mockHome = {
  id: 1,
  address: '15444 - Rue de Tunis',
  city: 'Sousse',
  price: 770000,
  property_type: PropertyType.RESIDENTIAL,
  image: 'img1',
  number_of_bedrooms: 5,
  number_of_bathrooms: 2,
};

const mockImages = [
  { id: 1, url: 'src1' },
  { id: 2, url: 'src2' },
];

//Get
describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: PrismaService,
          useValue: {
            home: {
              findMany: jest.fn().mockReturnValue(mockGetHomes),
              create: jest.fn().mockReturnValue(mockHome),
            },
            image: {
              createMany: jest.fn().mockReturnValue(mockImages),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('getHomes', () => {
    const filters = {
      city: 'Sousse',
      price: {
        gte: 700000,
        lte: 800000,
      },
      PropertyType: PropertyType.RESIDENTIAL,
    };
    it('should call prisma home.findMany with correct params', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(mockGetHomes);
      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);
      await service.getHomes(filters);
      expect(mockPrismaFindManyHomes).toBeCalledWith({
        select: {
          ...homeSelect,
          images: {
            select: {
              url: true,
            },
          },
        },
        where: filters,
      });
    });

    it('should throw not found exception if not homes are found', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue([]);
      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await expect(service.getHomes(filters)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });
  //Create
  describe('createHome', () => {
    const mockCreateHomeParams = {
      address: '15444 - Rue de Tunis',
      numberOfBedrooms: 3,
      numberOfBathrooms: 2,
      city: 'Sousse',
      price: 650000,
      landSize: 4000,
      propertyType: PropertyType.RESIDENTIAL,
      images: [{ url: 'src1' }],
    };
    it('should call prisma home.create with the correct payload', async () => {
      const mockCreateHome = jest.fn().mockReturnValue(mockHome);
      jest
        .spyOn(prismaService.home, 'create')
        .mockImplementation(mockCreateHome);

      await service.createHome(mockCreateHomeParams, 1);
      expect(mockCreateHome).toBeCalledWith({
        data: {
          address: '15444 - Rue de Tunis',
          number_of_bedrooms: 3,
          number_of_bathrooms: 2,
          city: 'Sousse',
          price: 650000,
          land_size: 4000,
          propertyType: PropertyType.RESIDENTIAL,
          realtor_id: 1,
        },
      });
    });

    it('should call prisma image.createMany with the correct payload', async () => {
      const mockCreateManyImage = jest.fn().mockReturnValue(mockImages);
      jest
        .spyOn(prismaService.image, 'createMany')
        .mockImplementation(mockCreateManyImage);

      await service.createHome(mockCreateHomeParams, 1);
      expect(mockCreateManyImage).toBeCalledWith({
        data: [{ url: 'src1', home_id: 1 }],
      });
    });
  });
});
