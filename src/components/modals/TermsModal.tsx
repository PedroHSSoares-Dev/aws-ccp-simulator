import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CheckCircle2, Shield, AlertTriangle } from 'lucide-react';

interface TermsModalProps {
    isOpen: boolean;
    onAccept: () => void;
    onDecline: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onAccept, onDecline }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onDecline}
            title="Termos de Uso e Licença"
            size="lg"
            showCloseButton={true} // Allow closing via X
            closeOnOverlayClick={true} // Allow closing by clicking outside
        >
            <div className="space-y-6">
                <div className="bg-aws-light-blue/10 p-4 rounded-lg flex items-start gap-3 border border-aws-light-blue/20">
                    <Shield className="w-6 h-6 text-aws-light-blue shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-text-primary mb-1">Licença de Uso Pessoal</h4>
                        <p className="text-sm text-text-secondary">
                            Este software é gratuito apenas para <strong>estudo pessoal</strong>. É estritamente proibido utilizá-lo para:
                        </p>
                        <ul className="list-disc list-inside text-sm text-text-secondary mt-2 space-y-1 ml-2">
                            <li>Vender cursos ou treinamentos.</li>
                            <li>Comercializar acesso à plataforma.</li>
                            <li>Distribuir versões modificadas sem autorização.</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-warning/5 p-4 rounded-lg flex items-start gap-3 border border-warning/20">
                    <AlertTriangle className="w-6 h-6 text-warning shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-text-primary mb-1">Isenção de Responsabilidade</h4>
                        <p className="text-sm text-text-secondary">
                            Este é um simulador não-oficial. As questões são geradas com auxílio de IA e podem conter imprecisões. Sempre consulte a documentação oficial da AWS.
                        </p>
                    </div>
                </div>

                <div className="border-t border-border pt-6 flex flex-col gap-4">
                    <p className="text-sm text-text-tertiary text-center">
                        Ao continuar, você concorda com os termos acima e com a política de licença do projeto.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                            onClick={onDecline}
                            variant="outline"
                            className="w-full sm:w-auto min-w-[150px]"
                            size="lg"
                        >
                            Não aceito
                        </Button>
                        <Button
                            onClick={onAccept}
                            className="w-full sm:w-auto min-w-[200px]"
                            size="lg"
                        >
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            Li e Concordo
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
