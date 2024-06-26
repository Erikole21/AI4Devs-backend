import { Request, Response } from 'express';
import { addCandidate, findCandidateById, getCandidatesByPosition, updateCandidateStage, getInterviewFlowByPosition } from '../../application/services/candidateService';

export const addCandidateController = async (req: Request, res: Response) => {
    try {
        const candidateData = req.body;
        const candidate = await addCandidate(candidateData);
        res.status(201).json({ message: 'Candidate added successfully', data: candidate });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(400).json({ message: 'Error adding candidate', error: error.message });
        } else {
            res.status(400).json({ message: 'Error adding candidate', error: 'Unknown error' });
        }
    }
};

export const getCandidateById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        const candidate = await findCandidateById(id);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        res.json(candidate);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getCandidatesByPositionController = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const candidates = await getCandidatesByPosition(Number(id));
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo los candidatos para la posición' });
  }
};

export const updateCandidateStageController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { currentInterviewStep } = req.body;

  try {
    const updatedCandidate = await updateCandidateStage(Number(id), currentInterviewStep);
    res.status(200).json(updatedCandidate);
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando la etapa del candidato' });
  }
};

export const getInterviewFlowByPositionController = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const interviewFlow = await getInterviewFlowByPosition(Number(id));
    res.status(200).json(interviewFlow);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo el flujo de entrevistas para la posición' });
  }
};
        
export { addCandidate };