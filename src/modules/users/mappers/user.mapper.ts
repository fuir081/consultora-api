/**Porque la entidad representa la base de datos, 
mientras que el DTO representa lo que la API expone. Así puedes cambiar 
uno sin afectar al otro.
*/

import { User } from '../entities/user.entity';
import { UserResponseDto } from '../dto/user-response.dto';

export class UserMapper {
  static toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      companyRut: user.companyRut,
      companyName: user.companyName,
      representativeName: user.representativeName,
      representativeRut: user.representativeRut,
      phone: user.phone,
      email: user.email,
      megaNodeId: user.megaNodeId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
