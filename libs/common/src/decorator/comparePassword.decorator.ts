import * as bcrypt from 'bcrypt';


export async function comparePassword(
    password: string, 
    hashedPassword: string
) {
  return await bcrypt.compare(password, hashedPassword);
}
