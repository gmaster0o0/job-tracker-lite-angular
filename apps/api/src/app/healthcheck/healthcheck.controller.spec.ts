import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './healthcheck.controller';
import { HealthService } from './healthcheck.service';

describe('HealthcheckController', () => {
  let controller: HealthController;
  let healthService: {
    checkLiveness: jest.Mock;
    checkReadiness: jest.Mock;
    checkDetailed: jest.Mock;
  };

  beforeEach(async () => {
    healthService = {
      checkLiveness: jest.fn().mockReturnValue({ status: 'ok' }),
      checkReadiness: jest.fn().mockReturnValue({ status: 'ok' }),
      checkDetailed: jest.fn().mockReturnValue({ status: 'ok' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: healthService }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates live() to HealthService.checkLiveness', () => {
    controller.live();
    expect(healthService.checkLiveness).toHaveBeenCalled();
  });

  it('delegates ready() to HealthService.checkReadiness', () => {
    controller.ready();
    expect(healthService.checkReadiness).toHaveBeenCalled();
  });

  it('delegates detailed() to HealthService.checkDetailed', () => {
    controller.detailed();
    expect(healthService.checkDetailed).toHaveBeenCalled();
  });
});
