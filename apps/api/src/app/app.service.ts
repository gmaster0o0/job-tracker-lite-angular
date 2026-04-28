import { Injectable } from '@nestjs/common';
import { User } from '@job-tracker-lite-angular/api-interfaces';

@Injectable()
export class AppService {
  getData(): User {
    return {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password',
    };
  }
}
