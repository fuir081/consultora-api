/**Porque la entidad representa la base de datos, 
mientras que el DTO representa lo que la API expone. Así puedes cambiar 
uno sin afectar al otro.
*/

import { User } from '../entities/user.entity';
import { UserResponseDto } from '../dto/user-response.dto';

// En la función que retorna el DTO, ajusta el mapeo:
export const mapUserToDto = (user: User) => {
  const { password, ...userWithoutPassword } = user;

  return {
    ...userWithoutPassword,
    // Leer desde la relación company en lugar del objeto user directamente
    companyRut: user.company?.rut || null,
    companyName: user.company?.razonSocial || null,
    megaNodeId: user.company?.megaNodeId || null,
  };
};
