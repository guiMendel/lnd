import { fillFirevase } from 'vue-firevase';
import { firebaseApp } from './firebase';

type Dia =
  | 'segunda'
  | 'terça'
  | 'quarta'
  | 'quinta'
  | 'sexta'
  | 'sábado'
  | 'domingo';

type Papel = 'monitor' | 'professor' | null;

type TipoChamada =
  | 'presença'
  | 'falta'
  | 'substituição'
  | 'substituição-professor';

type Turma = {
  /** Nivel tecnico da turma */
  nivel: number;
};

type Horario = {
  dia: Dia;
  hora: number;
};

type Estilo = {
  nome: string;
};

type Usuario<P extends Papel = null> = {
  nome: string;
  email: string;
  papel: P;
  admin: boolean;
};

type Monitor = Usuario<'monitor'> & {
  dataDeEntrada: Date;
  pezinhos: number;
};

type Chamada = {
  idMonitor: string;
  idTurma: string;
  idHorario: string;

  tipo: TipoChamada;
};

type Pulseira = {
  idMonitor: string;
  idEstilo: string;

  /** Nivel de 1 a 3 indicando o quao proficiente o monitor eh em um estilo */
  nivel: number;
};

export const vase = fillFirevase<{
  turmas: Turma;
  estilos: Estilo;
  usuarios: Usuario;
  horarios: Horario;
  chamadas: Chamada;
  pulseiras: Pulseira;
}>(firebaseApp, [
  'estilos',
  'usuarios',
  'turmas',
  'horarios',
  'chamadas',
  'pulseiras',
])
  .configureManyToMany({
    horariosTurmas: ['horarios', 'turmas'],
    estilosTurmas: ['estilos', 'turmas'],
    professoresTurmas: ['usuarios', 'turmas'],
    monitoresTurmasFixas: ['usuarios', 'turmas'],
  })
  .configureRelations(({ hasMany, hasOne }) => ({
    estilos: {
      turmas: hasMany('turmas', { manyToManyTable: 'estilosTurmas' }),
    },
    horarios: {
      turmas: hasMany('turmas', { manyToManyTable: 'horariosTurmas' }),
    },
    usuarios: {
      turmasFixo: hasMany('turmas', {
        manyToManyTable: 'monitoresTurmasFixas',
      }),
      turmasProfessor: hasMany('turmas', {
        manyToManyTable: 'professoresTurmas',
      }),
      pulseiras: hasMany('pulseiras', { relationKey: 'idMonitor' }),
      chamadas: hasMany('chamadas', { relationKey: 'idMonitor' }),
    },
    turmas: {
      professores: hasMany('usuarios', {
        manyToManyTable: 'professoresTurmas',
      }),
      estilos: hasMany('estilos', { manyToManyTable: 'estilosTurmas' }),
      monitores: hasMany('usuarios', {
        manyToManyTable: 'monitoresTurmasFixas',
      }),
      horarios: hasMany('horarios', { manyToManyTable: 'horariosTurmas' }),
    },
    pulseiras: {
      monitor: hasOne('usuarios', { relationKey: 'idMonitor' }),
      estilo: hasOne('estilos', { relationKey: 'idEstilo' }),
    },
    chamadas: {
      monitor: hasOne('usuarios', { relationKey: 'idMonitor' }),
      estilo: hasOne('estilos', { relationKey: 'idEstilo' }),
    },
  }));
