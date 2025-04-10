import { App } from '@/app';
import { AuthRoute } from '@routes/auth.route';
import { UserRoute } from '@routes/users.route';
import { ValidateEnv } from '@utils/validateEnv';
import connectDB from 'config/db'

ValidateEnv();

const app = new App([new UserRoute(), new AuthRoute()]);

connectDB();
app.listen();
