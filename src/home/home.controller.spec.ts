import { Test, TestingModule } from '@nestjs/testing';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyType } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';

const mockUser = {
  id: 53,
  name: 'rayen',
  email: 'rayen@gmail.com',
  phone: '55 555 555',
};

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

describe('HomeController', () => {
  let controller: HomeController;
  let homeService: HomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [
        {
          provide: HomeService,
          useValue: {
            getHomes: jest.fn().mockReturnValue([]),
            getRealtorByHomeId: jest.fn().mockReturnValue(mockUser),
            updateHomeById: jest.fn().mockReturnValue(mockHome),
          },
        },
        PrismaService,
      ],
    }).compile();

    controller = module.get<HomeController>(HomeController);
    homeService = module.get<HomeService>(HomeService);
  });

  describe('getHomes', () => {
    it('should construct filter object correctly', async () => {
      const mockGetHomes = jest.fn().mockReturnValue([]);
      jest.spyOn(homeService, 'getHomes').mockImplementation(mockGetHomes);
      await controller.getHomes('Sousse', '150000');
      expect(mockGetHomes).toBeCalledWith({
        city: 'Sousse',
        price: { gte: 150000 },
      });
    });
  });

  describe('getHomes', () => {
    it('should construct filter object correctly', async () => {
      const mockGetHomes = jest.fn().mockReturnValue([]);
      jest.spyOn(homeService, 'getHomes').mockImplementation(mockGetHomes);
      await controller.getHomes('Sousse', '150000');
      expect(mockGetHomes).toBeCalledWith({
        city: 'Sousse',
        price: { gte: 150000 },
      });
    });
  });

  describe('updateHome', () => {
    const mockUserInfo = {
      name: 'Rayen',
      id: 30,
      iat: 1,
      exp: 2,
    };

    const mockCreateHomeParams = {
      address: '15444 - Rue de Tunis',
      numberOfBedrooms: 3,
      numberOfBathrooms: 2,
      city: 'Sousse',
      price: 650000,
      landSize: 4000,
      propertyType: PropertyType.RESIDENTIAL,
    };

    const mockUpdateHomeParams = {
      address: '15444 - Rue de Tunis',
      numberOfBedrooms: 3,
      numberOfBathrooms: 2,
      city: 'Sousse',
      price: 650000,
      landSize: 4000,
      propertyType: PropertyType.RESIDENTIAL,
    };
    it("should throw unauth error if realtor didn't create home", async () => {
      await expect(
        controller.updateHome(5, mockCreateHomeParams, mockUserInfo),
      ).rejects.toThrowError(UnauthorizedException);
    });

    it('should update home if realtor id is valid', async () => {
      const mockUpdateHome = jest.fn().mockReturnValue(mockHome);
      jest
        .spyOn(homeService, 'updateHomeById')
        .mockImplementation(mockUpdateHome);

      await controller.updateHome(5, mockUpdateHomeParams, {
        ...mockUserInfo,
        id: 53, //current user
      });
      expect(mockUpdateHome).toBeCalled();
    });
  });
});
