import { Candidate } from '../../domain/models/Candidate';
import { validateCandidateData } from '../validator';
import { Education } from '../../domain/models/Education';
import { WorkExperience } from '../../domain/models/WorkExperience';
import { Resume } from '../../domain/models/Resume';
import { Position } from '../../domain/models/Position';

export const addCandidate = async (candidateData: any) => {
    try {
        validateCandidateData(candidateData); // Validar los datos del candidato
    } catch (error: any) {
        throw new Error(error);
    }

    const candidate = new Candidate(candidateData); // Crear una instancia del modelo Candidate
    try {
        const savedCandidate = await candidate.save(); // Guardar el candidato en la base de datos
        const candidateId = savedCandidate.id; // Obtener el ID del candidato guardado

        // Guardar la educación del candidato
        if (candidateData.educations) {
            for (const education of candidateData.educations) {
                const educationModel = new Education(education);
                educationModel.candidateId = candidateId;
                await educationModel.save();
                candidate.education.push(educationModel);
            }
        }

        // Guardar la experiencia laboral del candidato
        if (candidateData.workExperiences) {
            for (const experience of candidateData.workExperiences) {
                const experienceModel = new WorkExperience(experience);
                experienceModel.candidateId = candidateId;
                await experienceModel.save();
                candidate.workExperience.push(experienceModel);
            }
        }

        // Guardar los archivos de CV
        if (candidateData.cv && Object.keys(candidateData.cv).length > 0) {
            const resumeModel = new Resume(candidateData.cv);
            resumeModel.candidateId = candidateId;
            await resumeModel.save();
            candidate.resumes.push(resumeModel);
        }
        return savedCandidate;
    } catch (error: any) {
        if (error.code === 'P2002') {
            // Unique constraint failed on the fields: (`email`)
            throw new Error('The email already exists in the database');
        } else {
            throw error;
        }
    }
};

export const findCandidateById = async (id: number): Promise<Candidate | null> => {
    try {
        const candidate = await Candidate.findOne(id); // Cambio aquí: pasar directamente el id
        return candidate;
    } catch (error) {
        console.error('Error al buscar el candidato:', error);
        throw new Error('Error al recuperar el candidato');
    }
};

export const getCandidatesByPosition = async (positionId: number) => {
  const applications = await Candidate.findApplicationsByPosition(positionId);

  return applications.map(application => {
    const averageScore = application.interviews.length
      ? application.interviews.reduce((sum, interview) => sum + (interview.score || 0), 0) / application.interviews.length
      : 0;

    return {
      fullName: `${application.candidate.firstName} ${application.candidate.lastName}`,
      current_interview_step: application.currentInterviewStep,
      averageScore,
    };
  });
};

export const updateCandidateStage = async (id: number, currentInterviewStep: string) => {
  const candidate = await Candidate.findOne(id);
  if (!candidate) {
    throw new Error('Candidate not found');
  }

  candidate.currentInterviewStep = currentInterviewStep;
  return await candidate.save();
};

export const getInterviewFlowByPosition = async (positionId: number) => {
  const position = await Position.findOne(positionId);
  if (!position) {
    throw new Error('Position not found');
  }

  const interviewFlow = await position.getInterviewFlow();
  return {
    positionName: position.title,
    interviewFlow,
  };
};